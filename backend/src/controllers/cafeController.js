const Cafe = require('../models/Cafe');

exports.getAllCafes = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    
    let sortOption = { createdAt: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const cafes = await Cafe.find(query).sort(sortOption);
    res.json({ success: true, data: cafes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCafeById = async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id);
    if (!cafe) return res.status(404).json({ success: false, message: 'Cafe not found' });
    res.json({ success: true, data: cafe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCafe = async (req, res) => {
  try {
    const cafe = new Cafe(req.body);
    await cafe.save();
    res.status(201).json({ success: true, data: cafe });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateCafe = async (req, res) => {
  try {
    const cafe = await Cafe.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!cafe) return res.status(404).json({ success: false, message: 'Cafe not found' });
    res.json({ success: true, data: cafe });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteCafe = async (req, res) => {
  try {
    const cafe = await Cafe.findByIdAndDelete(req.params.id);
    if (!cafe) return res.status(404).json({ success: false, message: 'Cafe not found' });
    res.json({ success: true, message: 'Cafe deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
