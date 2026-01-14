import User from '../models/User.js';

// @desc    Hent alle brukere
// @route   GET /api/users
// @access  Public
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Hent én bruker
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Bruker ikke funnet' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Opprett ny bruker
// @route   POST /api/users
// @access  Public
export const createUser = async (req, res) => {
  try {
    const { name, email, age } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Bruker eksisterer allerede' });
    }

    const user = await User.create({ name, email, age });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Oppdater bruker
// @route   PUT /api/users/:id
// @access  Public
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.age = req.body.age || user.age;

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'Bruker ikke funnet' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Slett bruker
// @route   DELETE /api/users/:id
// @access  Public
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (user) {
      await user.deleteOne();
      res.json({ message: 'Bruker slettet' });
    } else {
      res.status(404).json({ message: 'Bruker ikke funnet' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
