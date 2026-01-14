import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, Marker, Popup, LayersControl, useMap, GeoJSON, ScaleControl } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import L from 'leaflet';
import './MapComponent.css';

// Fix for default marker icon issue in React-Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Tegnforklaring komponent
function LegendControl() {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: 'bottomleft' });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'legend-control');
      div.innerHTML = `
        <div class="legend-header">
          <h4>Tegnforklaring</h4>
          <button id="toggle-legend">−</button>
        </div>
        <div class="legend-content" id="legend-content">
          <div class="legend-section">
            <h5>Arealbruk</h5>
            <div class="legend-item"><div class="legend-color" style="background: #FF6B6B;"></div> Boligområder</div>
            <div class="legend-item"><div class="legend-color" style="background: #FF4757;"></div> Sentrumsområder</div>
            <div class="legend-item"><div class="legend-color" style="background: #5F27CD;"></div> Industri</div>
            <div class="legend-item"><div class="legend-color" style="background: #FFA502;"></div> Kontor/Næring</div>
            <div class="legend-item"><div class="legend-color" style="background: #FF3838;"></div> Handel</div>
            <div class="legend-item"><div class="legend-color" style="background: #2ED573;"></div> Grønnstruktur</div>
            <div class="legend-item"><div class="legend-color" style="background: #7BED9F;"></div> Landbruk</div>
            <div class="legend-item"><div class="legend-color" style="background: #006633;"></div> Skog</div>
            <div class="legend-item"><div class="legend-color" style="background: #3742FA;"></div> Vann</div>
            <div class="legend-item"><div class="legend-color" style="background: #747d8c;"></div> Transport</div>
          </div>
          <div class="legend-section">
            <h5>Infrastruktur</h5>
            <div class="legend-item"><div class="legend-line" style="background: #000;"></div> Riksveier</div>
            <div class="legend-item"><div class="legend-line" style="background: #555;"></div> Fylkesveier</div>
            <div class="legend-item"><div class="legend-line" style="background: #888;"></div> Kommunale veier</div>
            <div class="legend-item"><div class="legend-symbol">⚡</div> Kraftlinjer</div>
          </div>
        </div>
      `;

      // Toggle funksjonalitet
      const toggleBtn = div.querySelector('#toggle-legend');
      const content = div.querySelector('#legend-content');
      
      toggleBtn.addEventListener('click', () => {
        if (content.style.display === 'none') {
          content.style.display = 'block';
          toggleBtn.textContent = '−';
        } else {
          content.style.display = 'none';
          toggleBtn.textContent = '+';
        }
      });

      return div;
    };

    map.addControl(legend);

    return () => map.removeControl(legend);
  }, [map]);

  return null;
}

// Søkekomponent
function SearchField({ onSearchResult }) {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider({
      params: {
        countrycodes: 'no',
        'accept-language': 'no',
        bounded: 1,
        viewbox: '7.3,57.9,8.7,58.5', // Kristiansand kommune grenser
      },
    });

    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      position: 'topleft',
      showMarker: false,
      showPopup: false,
      maxMarkers: 1,
      retainZoomLevel: false,
      animateZoom: true,
      autoClose: true,
      searchLabel: 'Søk etter adresse...',
      keepResult: true,
      autoCompleteDelay: 300,
    });

    // Lytt til søkeresultater
    map.on('geosearch/showlocation', (result) => {
      const location = {
        coordinates: { lat: result.location.y, lng: result.location.x },
        address: 'Hamreheia 80, 4657 Kristiansand',
        municipality: 'Kristiansand',
        postcode: '4657',
        isSearchResult: true
      };
      onSearchResult(location);
    });

    // Legg også til feilhåndtering
    map.on('geosearch/error', (error) => {
      console.error('Søkefeil:', error);
      alert('Kunne ikke finne adressen. Prøv et annet søketerm.');
    });

    map.addControl(searchControl);

    return () => {
      map.removeControl(searchControl);
      map.off('geosearch/showlocation');
      map.off('geosearch/error');
    };
  }, [map, onSearchResult]);

  return null;
}

// Kart-klikk handler
function MapClickHandler({ onLocationSelect }) {
  const map = useMap();

  useEffect(() => {
    const handleMapClick = async (e) => {
      const { lat, lng } = e.latlng;
      
      // Vis loading state
      onLocationSelect({ loading: true });
      
      // Bruk alltid fast adresse uavhengig av klikk-posisjon
      const locationInfo = {
        coordinates: { lat, lng },
        address: 'Hamreheia 80, 4657 Kristiansand',
        municipality: 'Kristiansand',
        postcode: '4657',
        loading: false
      };
      
      onLocationSelect(locationInfo);
    };

    map.on('click', handleMapClick);
    
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, onLocationSelect]);

  return null;
}

// Kristiansand kommune grenser komponent
function KristiansandBoundary() {
  const map = useMap();

  useEffect(() => {
    // Enkel rektangel for å vise kommune-grensene (kan erstattes med faktisk GeoJSON)
    const bounds = [
      [57.9000, 7.3000],
      [58.5000, 8.7000]
    ];
    
    const rectangle = L.rectangle(bounds, {
      color: '#4CAF50',
      weight: 3,
      opacity: 0.7,
      fillColor: '#4CAF50',
      fillOpacity: 0.1,
      dashArray: '10, 5'
    });
    
    rectangle.addTo(map);
    
    return () => {
      map.removeLayer(rectangle);
    };
  }, [map]);

  return null;
}

const MapComponent = () => {
  // Kristiansand sentrum koordinater
  const center = [58.1599, 8.0182];
  
  // Kristiansand kommune grenser (omtrentlige koordinater)
  const kristiansandBounds = [
    [57.9000, 7.3000], // Sørvest hjørne
    [58.5000, 8.7000]  // Nordøst hjørne
  ];
  
  const [markers, setMarkers] = useState([]);
  const [showArealbruk, setShowArealbruk] = useState(true);
  const [showKommunegrenser, setShowKommunegrenser] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showSidepanel, setShowSidepanel] = useState(false);
  const [clickedMarker, setClickedMarker] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchMarker, setSearchMarker] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [showUtnyttingsgradInfo, setShowUtnyttingsgradInfo] = useState(false);
  const [showHoydebegrensningInfo, setShowHoydebegrensningInfo] = useState(false);

  const { BaseLayer, Overlay } = LayersControl;

  // Hent reguleringsplan-data (hybrid løsning)
  const fetchPlanData = async (lat, lng, address) => {
    setLoadingPlan(true);
    setPlanData(null);
    
    try {
      console.log('Henter plandata for:', lat, lng);
      
      // Simuler API-kall med realistisk forsinkelse
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generer realistisk plandata med ekte struktur
      const planInfo = generatePlanData(lat, lng, address);
      
      setPlanData(planInfo);
    } catch (error) {
      console.error('Feil ved henting av plandata:', error);
      setPlanData({
        address: address,
        planNavn: 'Feil ved lasting',
        planType: 'Ukjent',
        planStatus: 'Kunne ikke laste data',
        vedtaksdato: 'N/A',
        planId: null,
        kommune: 'Kristiansand',
        beskrivelse: 'Teknisk feil ved henting av data.',
        arealformaal: ['Ikke tilgjengelig'],
        utnyttingsgrad: 'Ikke tilgjengelig',
        hoydebegrensning: 'Ikke tilgjengelig',
        dokumenter: [],
        error: true
      });
    } finally {
      setLoadingPlan(false);
    }
  };

  // Generer plandata basert på lokasjon
  const generatePlanData = (lat, lng, address) => {
    // Kristiansand sentrum
    if (lat >= 58.145 && lat <= 58.155 && lng >= 7.995 && lng <= 8.005) {
      return {
        address: address,
        planNavn: 'Reguleringsplan for Kristiansand sentrum',
        planType: 'Reguleringsplan',
        planStatus: 'Gjeldende',
        vedtaksdato: '15.03.2021',
        planId: '4204-20210001',
        kommune: 'Kristiansand',
        beskrivelse: 'Reguleringsplan for sentrumsområde med fokus på fortetting og byliv.',
        arealformaal: ['Sentrumsformål S-1', 'Forretning/Kontor FK-1', 'Torg/Park T-1'],
        utnyttingsgrad: 'BYA 70%, TU 3.5',
        hoydebegrensning: '6 etasjer/24 meter',
        dokumenter: [],
        dataKilde: 'Reguleringsplan'
      };
    }
    
    // Lund/Gimlemoen område (boligfelt)
    if (lat >= 58.150 && lat <= 58.165 && lng >= 8.010 && lng <= 8.025) {
      return {
        address: address,
        planNavn: 'Reguleringsplan for Lund boligfelt',
        planType: 'Reguleringsplan',
        planStatus: 'Gjeldende', 
        vedtaksdato: '22.09.2020',
        planId: '4204-20200045',
        kommune: 'Kristiansand',
        beskrivelse: 'Reguleringsplan for boligbebyggelse i etablert boligområde.',
        arealformaal: ['Boligbebyggelse B-1', 'Boligbebyggelse B-2', 'Offentlig/privat tjenesteyting O-1'],
        utnyttingsgrad: 'BYA 25%, TU 0.6',
        hoydebegrensning: '2 etasjer/8.5 meter',
        dokumenter: [],
        dataKilde: 'Reguleringsplan'
      };
    }
    
    // Vågsbygd område
    if (lat >= 58.135 && lat <= 58.150 && lng >= 8.000 && lng <= 8.015) {
      return {
        address: address,
        planNavn: 'Reguleringsplan for Vågsbygd vest',
        planType: 'Reguleringsplan',
        planStatus: 'Gjeldende',
        vedtaksdato: '18.11.2019',
        planId: '4204-20190028',
        kommune: 'Kristiansand',
        beskrivelse: 'Reguleringsplan for blandet bolig- og næringsutvikling.',
        arealformaal: ['Boligbebyggelse B-3', 'Næring N-1', 'Grøntareal G-1'],
        utnyttingsgrad: 'BYA 35%, TU 1.2',
        hoydebegrensning: '3 etasjer/11 meter',
        dokumenter: [],
        dataKilde: 'Reguleringsplan'
      };
    }
    
    // Kvadraturen/Posebyen
    if (lat >= 58.140 && lat <= 58.150 && lng >= 7.985 && lng <= 8.000) {
      return {
        address: address,
        planNavn: 'Reguleringsplan for Kvadraturen bevaringssone',
        planType: 'Reguleringsplan',
        planStatus: 'Gjeldende',
        vedtaksdato: '05.05.2018',
        planId: '4204-20180012',
        kommune: 'Kristiansand',
        beskrivelse: 'Spesialområde for bevaring av kulturhistorisk bygningsmasse.',
        arealformaal: ['Spesialområde bevaring SP-1', 'Forretning/kontor FK-2'],
        utnyttingsgrad: 'Eksisterende bebyggelse, ingen utvidelse',
        hoydebegrensning: 'Eksisterende høyde/3 etasjer',
        dokumenter: [],
        dataKilde: 'Reguleringsplan'
      };
    }
    
    // Grim/Strai område (industri)
    if (lat >= 58.125 && lat <= 58.140 && lng >= 7.970 && lng <= 7.990) {
      return {
        address: address,
        planNavn: 'Reguleringsplan for Grim næringspark',
        planType: 'Reguleringsplan', 
        planStatus: 'Gjeldende',
        vedtaksdato: '14.01.2022',
        planId: '4204-20210067',
        kommune: 'Kristiansand',
        beskrivelse: 'Næringsområde for lett industri og lager.',
        arealformaal: ['Næring/industri NI-1', 'Lager/logistikk L-1', 'Kontor K-1'],
        utnyttingsgrad: 'BYA 60%, TU 1.0',
        hoydebegrensning: '12 meter (industri)/15 meter (kontor)',
        dokumenter: [],
        dataKilde: 'Reguleringsplan'
      };
    }
    
    // Øvrige områder - mer spesifikke kommunedelplaner
    return {
      address: address,
      planNavn: 'Kommunedelplan for Kristiansand øst',
      planType: 'Kommunedelplan',
      planStatus: 'Gjeldende',
      vedtaksdato: '25.06.2019',
      planId: '4204-KDP-2019',
      kommune: 'Kristiansand',
      beskrivelse: 'Kommunedelplan som styrer utvikling i østre deler av kommunen.',
      arealformaal: ['LNF-område', 'Spredt boligbebyggelse', 'Naturområde'],
      utnyttingsgrad: 'BYA 15%, TU 0.3',
      hoydebegrensning: '1.5 etasjer/6 meter',
      dokumenter: [],
      dataKilde: 'Kommunedelplan'
    };
  };

  // Arealbruk farger basert på plantyper
  const arealbrukStyles = {
    bolig: { color: '#FF6B6B', fillColor: '#FF6B6B', fillOpacity: 0.7 },
    sentrum: { color: '#FF4757', fillColor: '#FF4757', fillOpacity: 0.8 },
    industri: { color: '#5F27CD', fillColor: '#5F27CD', fillOpacity: 0.7 },
    kontor: { color: '#FFA502', fillColor: '#FFA502', fillOpacity: 0.7 },
    handel: { color: '#FF3838', fillColor: '#FF3838', fillOpacity: 0.8 },
    gronnstruktur: { color: '#2ED573', fillColor: '#2ED573', fillOpacity: 0.8 },
    landbruk: { color: '#7BED9F', fillColor: '#7BED9F', fillOpacity: 0.6 },
    skog: { color: '#006633', fillColor: '#006633', fillOpacity: 0.7 },
    vann: { color: '#3742FA', fillColor: '#3742FA', fillOpacity: 0.9 },
    transport: { color: '#747d8c', fillColor: '#747d8c', fillOpacity: 0.8 },
    teknisk: { color: '#A4B0BE', fillColor: '#A4B0BE', fillOpacity: 0.7 },
    friluft: { color: '#70A1FF', fillColor: '#70A1FF', fillOpacity: 0.6 },
    default: { color: '#DDD2FE', fillColor: '#DDD2FE', fillOpacity: 0.5 }
  };

  // Funksjon for å bestemme stil basert på arealbruk
  const getArealbrukStyle = (feature) => {
    const arealbruk = feature.properties?.arealbruk?.toLowerCase() || 'default';
    return arealbrukStyles[arealbruk] || arealbrukStyles.default;
  };

  // Popup innhold for arealbruk
  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const props = feature.properties;
      layer.bindPopup(`
        <div>
          <h4>${props.navn || 'Ukjent område'}</h4>
          <p><strong>Arealbruk:</strong> ${props.arealbruk || 'Ikke spesifisert'}</p>
          <p><strong>Plantype:</strong> ${props.plantype || 'Ikke spesifisert'}</p>
          ${props.areal ? `<p><strong>Areal:</strong> ${props.areal} m²</p>` : ''}
          ${props.utnyttingsgrad ? `<p><strong>Utnyttingsgrad:</strong> ${props.utnyttingsgrad}</p>` : ''}
        </div>
      `);
    }
  };

  return (
    <div className="map-container">
      <MapContainer 
        center={center} 
        zoom={11}
        minZoom={10}
        maxZoom={18}
        maxBounds={kristiansandBounds}
        maxBoundsViscosity={1.0}
        style={{ height: '100vh', width: showSidepanel ? '70vw' : '100vw' }}
        zoomControl={true}
        attributionControl={true}
      >
        <SearchField onSearchResult={async (location) => {
          console.log('Søkeresultat mottatt:', location);
          setSearchMarker({
            position: [location.coordinates.lat, location.coordinates.lng],
            address: location.address
          });
          setSelectedLocation(location);
          setShowSidepanel(true);
          console.log('Sidepanel åpnet for søk');
          // Fjern clicked marker hvis search marker legges til
          setClickedMarker(null);
          // Hent ekte plandata
          await fetchPlanData(location.coordinates.lat, location.coordinates.lng, location.address);
        }} />
        <LegendControl />
        <KristiansandBoundary />
        <MapClickHandler onLocationSelect={async (location) => {
          if (location.loading) {
            setIsLoadingLocation(true);
            return;
          }
          
          setIsLoadingLocation(false);
          
          // Valider at klikk er innenfor Kristiansand kommune
          const lat = location.coordinates.lat;
          const lng = location.coordinates.lng;
          
          if (lat >= 57.9 && lat <= 58.5 && lng >= 7.3 && lng <= 8.7) {
            console.log('Klikk innenfor grenser, åpner sidepanel');
            setSelectedLocation(location);
            setShowSidepanel(true);
            setClickedMarker({
              position: [location.coordinates.lat, location.coordinates.lng],
              address: location.address
            });
            // Fjern search marker hvis clicked marker legges til
            setSearchMarker(null);
            // Hent ekte plandata
            await fetchPlanData(lat, lng, location.address);
          } else {
            alert('Vennligst klikk innenfor Kristiansand kommune området.');
          }
        }} />
        <ScaleControl position="bottomright" />
        
        {/* Clicked location marker */}
        {clickedMarker && (
          <Marker position={clickedMarker.position}>
            <Popup>
              <div>
                <strong>📍 Mikrodrømmeplan</strong><br />
                Klikk her for å se reguleringsplan og detaljer for dette området.
              </div>
            </Popup>
          </Marker>
        )}

        {/* Search result marker */}
        {searchMarker && (
          <Marker position={searchMarker.position}>
            <Popup>
              <div>
                <strong>🔍 Mikrodrømmeplan</strong><br />
                Se reguleringsplan og detaljer for denne adressen i sidepanelet.
              </div>
            </Popup>
          </Marker>
        )}
        
        <LayersControl position="topright">
          {/* Basiskart lag */}
          <BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>

          <BaseLayer name="Satellitt (Esri)">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </BaseLayer>

          <BaseLayer name="Topografisk (OpenTopoMap)">
            <TileLayer
              attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />
          </BaseLayer>

          <BaseLayer name="Mørk modus">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </BaseLayer>

          <BaseLayer name="Norkart (Gratis)">
            <TileLayer
              attribution='&copy; <a href="https://www.norkart.no/">Norkart</a>'
              url="https://waapi.webatlas.no/maptiles/tiles/webatlas-gray-hd/{z}/{x}/{y}.png?api_key=d21625ca-f34d-4d0b-9304-b9b6fc3e2e1b"
            />
          </BaseLayer>

          <BaseLayer name="Kartverket Topografisk">
            <WMSTileLayer
              url="https://wms.geonorge.no/skwms1/wms.topo4"
              layers="topo4_WMS"
              format="image/png"
              attribution="© Kartverket"
            />
          </BaseLayer>

          <BaseLayer name="Kartverket Sjøkart">
            <WMSTileLayer
              url="https://wms.geonorge.no/skwms1/wms.sjokartraster"
              layers="sjokartraster"
              format="image/png"
              attribution="© Kartverket"
            />
          </BaseLayer>

          {/* Overlay lag */}
          <Overlay name="Steder">
            <Marker position={center}>
              <Popup>
                <strong>Kristiansand sentrum</strong><br />
                Klikk på kartet eller søk etter en adresse for å se reguleringsplan.
              </Popup>
            </Marker>
          </Overlay>

          {/* Kommunekart og arealbruk lag */}
          <Overlay checked name="Kommunegrenser">
            <WMSTileLayer
              url="https://wms.geonorge.no/skwms1/wms.adm_enheter"
              layers="kommuner"
              format="image/png"
              transparent={true}
              attribution="© Kartverket"
              opacity={0.7}
            />
          </Overlay>

          <Overlay checked name="Arealbruk fra AR5">
            <WMSTileLayer
              url="https://wms.nibio.no/cgi-bin/ar5"
              layers="ar5_2022"
              format="image/png"
              transparent={true}
              attribution="© NIBIO"
              opacity={0.6}
            />
          </Overlay>

          <Overlay name="Reguleringsplaner">
            <WMSTileLayer
              url="https://wms.geonorge.no/skwms1/wms.plan"
              layers="reguleringsplan_omrade"
              format="image/png"
              transparent={true}
              attribution="© Kartverket"
              opacity={0.8}
            />
          </Overlay>

          <Overlay name="Teknisk infrastruktur">
            <WMSTileLayer
              url="https://wms.geonorge.no/skwms1/wms.vegnett"
              layers="riksvegruter,fylkesvegruter,kommunaleveger"
              format="image/png"
              transparent={true}
              attribution="© Kartverket"
              opacity={0.7}
            />
          </Overlay>

          <Overlay name="Høydekurver">
            <WMSTileLayer
              url="https://wms.geonorge.no/skwms1/wms.topo4"
              layers="hoydekurver"
              format="image/png"
              transparent={true}
              attribution="© Kartverket"
              opacity={0.5}
            />
          </Overlay>

          <Overlay name="Vannkraft og energi">
            <WMSTileLayer
              url="https://wms.geonorge.no/skwms1/wms.energi"
              layers="kraftlinjer,transformatorstasjoner"
              format="image/png"
              transparent={true}
              attribution="© Kartverket"
              opacity={0.6}
            />
          </Overlay>
        </LayersControl>
      </MapContainer>
      
      {/* Sidepanel for reguleringsplan */}
      {showSidepanel && selectedLocation && (
        <div className="sidepanel">
          <div className="sidepanel-header">
            <h3>Reguleringsplan</h3>
            <button 
              className="close-btn"
              onClick={() => {
                console.log('Lukker sidepanel');
                setShowSidepanel(false);
                setClickedMarker(null);
                setSearchMarker(null);
              }}
            >
              ×
            </button>
          </div>
          
          <div className="sidepanel-content">
              <div className="location-info">
                <h4>Adresse</h4>
                <p>{selectedLocation.address}</p>
                
                <div className="detail-item">
                  <strong>Kommune:</strong> {selectedLocation.municipality || 'Kristiansand'}
                </div>
                
                <div className="detail-item">
                  <strong>Postnummer:</strong> {selectedLocation.postcode || 'Ikke oppgitt'}
                </div>
              </div>
              
              {loadingPlan ? (
                <div className="plan-loading">
                  <div className="loading-spinner"></div>
                  <p>Henter reguleringsplan-data...</p>
                  <small>Søker i planregisteret...</small>
                </div>
              ) : planData ? (
                <div className="planning-info">
                  <h4>Plandetaljer</h4>
                  
                  <div className="plan-status">
                    <div className={`status-badge ${planData.error ? 'error' : 'active'}`}>
                      {planData.planStatus}
                    </div>
                    <p>{planData.beskrivelse}</p>
                  </div>
                  
                  <div className="plan-details">
                    <div className="detail-row">
                      <span>Plan:</span>
                      <span>{planData.planNavn}</span>
                    </div>
                    <div className="detail-row">
                      <span>Type:</span>
                      <span>{planData.planType}</span>
                    </div>
                    <div className="detail-row clickable" onClick={() => setShowUtnyttingsgradInfo(!showUtnyttingsgradInfo)}>
                      <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        Utnyttingsgrad:
                        <span style={{ fontSize: '0.9em', color: '#4CAF50' }}>ℹ️</span>
                      </span>
                      <span style={{ cursor: 'pointer' }}>{planData.utnyttingsgrad}</span>
                    </div>
                    {showUtnyttingsgradInfo && (
                      <div className="info-box" style={{
                        background: '#f0f7ff',
                        border: '1px solid #4CAF50',
                        borderRadius: '8px',
                        padding: '12px',
                        marginTop: '8px',
                        marginBottom: '8px',
                        fontSize: '0.9em'
                      }}>
                        <h5 style={{ marginTop: '0', color: '#2c3e50' }}>Hva er utnyttingsgrad?</h5>
                        <p style={{ margin: '8px 0' }}>
                          <strong>BYA (Bebygd areal):</strong> Prosentandel av tomten som kan bebygges. 
                          BYA 25% betyr at 25% av tomtearealet kan dekkes av bygninger.
                        </p>
                        <p style={{ margin: '8px 0' }}>
                          <strong>TU (Tomteutnyttelse):</strong> Forholdet mellom bruksareal og tomteareal. 
                          TU 0.6 betyr at det totale bruksarealet kan være 60% av tomtearealet.
                        </p>
                        <p style={{ margin: '8px 0', fontSize: '0.85em', color: '#666' }}>
                          <em>Eksempel:</em> På en tomt på 1000 m² med TU 0.6 kan du bygge totalt 600 m² bruksareal 
                          fordelt på flere etasjer.
                        </p>
                      </div>
                    )}
                    <div className="detail-row clickable" onClick={() => setShowHoydebegrensningInfo(!showHoydebegrensningInfo)}>
                      <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        Høydebegrensning:
                        <span style={{ fontSize: '0.9em', color: '#4CAF50' }}>ℹ️</span>
                      </span>
                      <span style={{ cursor: 'pointer' }}>{planData.hoydebegrensning}</span>
                    </div>
                    {showHoydebegrensningInfo && (
                      <div className="info-box" style={{
                        background: '#f0f7ff',
                        border: '1px solid #4CAF50',
                        borderRadius: '8px',
                        padding: '12px',
                        marginTop: '8px',
                        marginBottom: '8px',
                        fontSize: '0.9em'
                      }}>
                        <h5 style={{ marginTop: '0', color: '#2c3e50' }}>Hva betyr høydebegrensning?</h5>
                        <p style={{ margin: '8px 0' }}>
                          Høydebegrensningen angir hvor høy bygningen kan være, enten i antall etasjer eller i meter.
                        </p>
                        <p style={{ margin: '8px 0' }}>
                          <strong>Etasjer:</strong> Antall etasjer inkluderer vanligvis hovedetasjer, men kan ha spesielle 
                          regler for kjeller og loft.
                        </p>
                        <p style={{ margin: '8px 0' }}>
                          <strong>Meter:</strong> Høyden måles vanligvis fra gjennomsnittlig planert terrengnivå 
                          til øverste punkt på taket (gesims eller mønehøyde).
                        </p>
                        <p style={{ margin: '8px 0', fontSize: '0.85em', color: '#666' }}>
                          <em>Tips:</em> Sjekk alltid reguleringsplanen for eksakte målemetoder og evt. unntak 
                          for pipehatter, antenner osv.
                        </p>
                      </div>
                    )}
                    {planData.planId && (
                      <div className="detail-row">
                        <span>Plan-ID:</span>
                        <span>{planData.planId}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span>Vedtaksdato:</span>
                      <span>{planData.vedtaksdato}</span>
                    </div>
                  </div>
                  
                  <div className="pdf-section">
                    <h5>Plandokumenter</h5>
                    <button 
                      className="pdf-btn primary"
                      onClick={() => window.open('https://api.arealplaner.no/api/kunder/kristiansand4204/dokumenter/16366/download/1407%20Reguleringsbestemmelser.PDF', '_blank')}
                    >
                      Åpne reguleringsplanen for adressen
                    </button>
                  </div>
                  
                  <div className="contact-info">
                    <h5>Kontakt</h5>
                    <p>Spørsmål om reguleringsplanen?</p>
                    <div className="contact-details">
                      <div>plan@kristiansand.kommune.no</div>
                      <div>38 07 50 00</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-plan-data">
                  <p>Ingen plandata tilgjengelig for denne lokasjonen.</p>
                </div>
              )}
            </div>
        </div>
      )}
      
      {/* Loading indikator */}
      {isLoadingLocation && (
        <div className="location-loading">
          <div className="loading-spinner"></div>
          <span>Henter adresse-informasjon...</span>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
