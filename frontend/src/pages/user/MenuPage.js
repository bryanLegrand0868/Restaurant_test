import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../contexts/CartContext';
import { API_URL, formatPrice, DEFAULT_IMAGE, DIETARY_PREFERENCES } from '../../config/constants';
import './MenuPage.css';

// Material UI imports
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Divider,
  Skeleton,
  Box,
  Paper,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Slider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StarIcon from '@mui/icons-material/Star';

const MenuPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  
  // State variables
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(queryParams.get('category') || '');
  const [selectedDietaryPreferences, setSelectedDietaryPreferences] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortOption, setSortOption] = useState('recommended');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  
  // Fetch dishes and categories
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        
        // Fetch dishes with category filter if present
        let dishesUrl = `${API_URL}/api/menu/dishes`;
        if (selectedCategory) {
          dishesUrl += `?categoryId=${selectedCategory}`;
        }
        
        const dishesResponse = await axios.get(dishesUrl);
        setDishes(dishesResponse.data);
        
        // Fetch categories
        const categoriesResponse = await axios.get(`${API_URL}/api/menu/categories`);
        setCategories(categoriesResponse.data);
        
        // Get favorites from localStorage
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching menu data:', error);
        setError('Failed to load menu. Please try again later.');
        setLoading(false);
      }
    };

    fetchMenuData();
  }, [selectedCategory]);
  
  // Filter and sort dishes
  const filteredDishes = dishes
    .filter(dish => {
      const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dish.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || dish.categoryId === selectedCategory;
      
      const matchesDietaryPreferences = selectedDietaryPreferences.length === 0 ||
        selectedDietaryPreferences.every(pref => 
          dish.dietaryPreferences && dish.dietaryPreferences.includes(pref)
        );
      
      const matchesPriceRange = dish.price >= priceRange[0] && dish.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesDietaryPreferences && matchesPriceRange;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'price-low-high':
          return a.price - b.price;
        case 'price-high-low':
          return b.price - a.price;
        case 'name-a-z':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default: // 'recommended'
          return b.isPopular ? 1 : -1;
      }
    });
  
  // Update URL with filters
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedCategory) {
      params.set('category', selectedCategory);
    }
    
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    
    const newUrl = `${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    navigate(newUrl, { replace: true });
  }, [selectedCategory, searchTerm, navigate, location.pathname]);
  
  // Toggle favorite
  const toggleFavorite = (dishId) => {
    const newFavorites = favorites.includes(dishId)
      ? favorites.filter(id => id !== dishId)
      : [...favorites, dishId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };
  
  // Add to cart handler
  const handleAddToCart = (dish) => {
    addToCart(dish, 1);
  };
  
  // Toggle filter drawer
  const toggleFilterDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setFilterDrawerOpen(open);
  };
  
  // Handle category change
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };
  
  // Handle dietary preference change
  const handleDietaryPreferenceChange = (pref) => {
    setSelectedDietaryPreferences(prev => 
      prev.includes(pref)
        ? prev.filter(p => p !== pref)
        : [...prev, pref]
    );
  };
  
  // Handle price range change
  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedDietaryPreferences([]);
    setPriceRange([0, 100]);
    setSortOption('recommended');
  };
  
  // Render filter drawer
  const filterDrawer = (
    <Box
      sx={{ width: 280 }}
      role="presentation"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #eee' }}>
        <Typography variant="h6">Filters</Typography>
        <IconButton onClick={toggleFilterDrawer(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <List>
        <ListItem>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={handleCategoryChange}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </ListItem>
        
        <ListItem>
          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle2" gutterBottom>
              Dietary Preferences
            </Typography>
            <FormGroup>
              {DIETARY_PREFERENCES.map(pref => (
                <FormControlLabel
                  key={pref.value}
                  control={
                    <Checkbox
                      checked={selectedDietaryPreferences.includes(pref.value)}
                      onChange={() => handleDietaryPreferenceChange(pref.value)}
                      size="small"
                    />
                  }
                  label={pref.label}
                />
              ))}
            </FormGroup>
          </Box>
        </ListItem>
        
        <ListItem>
          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle2" gutterBottom>
              Price Range
            </Typography>
            <Slider
              value={priceRange}
              onChange={handlePriceRangeChange}
              valueLabelDisplay="auto"
              min={0}
              max={100}
              valueLabelFormat={(value) => `$${value}`}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">{formatPrice(priceRange[0])}</Typography>
              <Typography variant="body2">{formatPrice(priceRange[1])}</Typography>
            </Box>
          </Box>
        </ListItem>
        
        <ListItem>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              label="Sort By"
            >
              <MenuItem value="recommended">Recommended</MenuItem>
              <MenuItem value="price-low-high">Price: Low to High</MenuItem>
              <MenuItem value="price-high-low">Price: High to Low</MenuItem>
              <MenuItem value="name-a-z">Name: A to Z</MenuItem>
              <MenuItem value="rating">Highest Rated</MenuItem>
            </Select>
          </FormControl>
        </ListItem>
      </List>
      
      <Box sx={{ p: 2, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          color="secondary" 
          onClick={resetFilters}
        >
          Reset All
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={toggleFilterDrawer(false)}
        >
          Apply Filters
        </Button>
      </Box>
    </Box>
  );

  // Render menu header
  const renderMenuHeader = () => (
    <Box className="menu-header">
      <Typography variant="h4" component="h1" gutterBottom>
        Our Menu
      </Typography>
      
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={6} md={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={handleCategoryChange}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={6} md={3}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            startIcon={<FilterListIcon />}
            onClick={toggleFilterDrawer(true)}
          >
            Filters
          </Button>
        </Grid>
      </Grid>
      
      {selectedDietaryPreferences.length > 0 && (
        <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
          {selectedDietaryPreferences.map(pref => {
            const preference = DIETARY_PREFERENCES.find(p => p.value === pref);
            return (
              <Chip
                key={pref}
                label={preference?.label || pref}
                onDelete={() => handleDietaryPreferenceChange(pref)}
                color="primary"
                variant="outlined"
                size="small"
              />
            );
          })}
          <Chip
            label="Clear All Filters"
            onClick={resetFilters}
            color="secondary"
            size="small"
          />
        </Box>
      )}
      
      <Divider sx={{ my: 3 }} />
    </Box>
  );

  // Render dish grid
  const renderDishGrid = () => (
    <Grid container spacing={3}>
      {loading ? (
        // Skeleton loading
        Array.from(new Array(8)).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card>
              <Skeleton variant="rectangular" height={200} />
              <CardContent>
                <Skeleton variant="text" height={32} />
                <Skeleton variant="text" height={20} width="60%" />
                <Skeleton variant="text" height={20} width="40%" />
              </CardContent>
              <CardActions>
                <Skeleton variant="rectangular" width={100} height={36} />
              </CardActions>
            </Card>
          </Grid>
        ))
      ) : error ? (
        // Error message
        <Grid item xs={12}>
          <Paper className="error-message">
            <Typography color="error">{error}</Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </Paper>
        </Grid>
      ) : filteredDishes.length === 0 ? (
        // No dishes found
        <Grid item xs={12}>
          <Paper className="no-results">
            <Typography variant="h6" gutterBottom>
              No dishes found
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Try adjusting your filters or search term
            </Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={resetFilters}
              sx={{ mt: 2 }}
            >
              Clear Filters
            </Button>
          </Paper>
        </Grid>
      ) : (
        // Dish cards
        filteredDishes.map(dish => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={dish.id}>
            <Card className="dish-card">
              <CardMedia
                component="img"
                height="200"
                image={dish.imageUrl || DEFAULT_IMAGE}
                alt={dish.name}
              />
              
              {/* Favorite button */}
              <IconButton 
                className="favorite-button"
                onClick={() => toggleFavorite(dish.id)}
                color={favorites.includes(dish.id) ? 'error' : 'default'}
              >
                {favorites.includes(dish.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              
              {/* Popular badge */}
              {dish.isPopular && (
                <Chip 
                  icon={<StarIcon />} 
                  label="Popular" 
                  color="secondary" 
                  size="small"
                  className="popular-badge"
                />
              )}
              
              <CardContent>
                <Typography 
                  variant="h6" 
                  component={Link} 
                  to={`/menu/dish/${dish.id}`}
                  className="dish-name-link"
                >
                  {dish.name}
                </Typography>
                
                {dish.categoryName && (
                  <Typography 
                    variant="body2" 
                    color="textSecondary" 
                    gutterBottom
                  >
                    {dish.categoryName}
                  </Typography>
                )}
                
                <Typography 
                  variant="body2" 
                  color="textSecondary" 
                  className="dish-description"
                >
                  {dish.description}
                </Typography>
                
                <Box mt={1} display="flex" flexWrap="wrap" gap={0.5}>
                  {dish.dietaryPreferences && dish.dietaryPreferences.map(pref => {
                    const preference = DIETARY_PREFERENCES.find(p => p.value === pref);
                    return (
                      <Chip
                        key={pref}
                        label={preference?.label || pref}
                        size="small"
                        variant="outlined"
                        className="dish-tag"
                      />
                    );
                  })}
                </Box>
                
                <Typography 
                  variant="h6" 
                  color="primary" 
                  className="dish-price"
                >
                  {formatPrice(dish.price)}
                </Typography>
              </CardContent>
              
              <CardActions className="dish-actions">
                <Button 
                  variant="outlined" 
                  color="primary"
                  size="small"
                  component={Link}
                  to={`/menu/dish/${dish.id}`}
                >
                  View Details
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<AddShoppingCartIcon />}
                  onClick={() => handleAddToCart(dish)}
                >
                  Add to Cart
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))
      )}
    </Grid>
  );

  return (
    <Container className="menu-page">
      {renderMenuHeader()}
      {renderDishGrid()}
      
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={toggleFilterDrawer(false)}
      >
        {filterDrawer}
      </Drawer>
    </Container>
  );
};

export default MenuPage;
