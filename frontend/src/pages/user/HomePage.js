import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL, formatPrice } from '../../config/constants';
import './HomePage.css';

// Material UI imports
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Skeleton,
  Box,
  Paper,
  Chip
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StarIcon from '@mui/icons-material/Star';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';

const HomePage = () => {
  const [featuredDishes, setFeaturedDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        
        // Fetch featured dishes
        const dishesResponse = await axios.get(`${API_URL}/api/menu/featured`);
        setFeaturedDishes(dishesResponse.data);
        
        // Fetch categories
        const categoriesResponse = await axios.get(`${API_URL}/api/menu/categories`);
        setCategories(categoriesResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching home page data:', error);
        setError('Failed to load content. Please try again later.');
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const renderHeroSection = () => (
    <div className="hero-section">
      <div className="hero-content">
        <Typography variant="h2" component="h1" className="hero-title">
          Delicious Food Delivered to Your Door
        </Typography>
        <Typography variant="h5" component="p" className="hero-subtitle">
          Order from our wide selection of gourmet meals prepared by top chefs
        </Typography>
        <Button 
          component={Link} 
          to="/menu" 
          variant="contained" 
          color="primary" 
          size="large"
          endIcon={<ArrowForwardIcon />}
          className="hero-button"
        >
          Browse Menu
        </Button>
      </div>
    </div>
  );

  const renderFeaturedDishes = () => (
    <section className="section">
      <Typography variant="h4" component="h2" className="section-title">
        Featured Dishes
      </Typography>
      <Grid container spacing={3}>
        {loading ? (
          // Skeleton loading state
          Array.from(new Array(4)).map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card className="dish-card">
                <Skeleton variant="rectangular" height={160} />
                <CardContent>
                  <Skeleton variant="text" height={28} />
                  <Skeleton variant="text" height={20} width="60%" />
                  <Skeleton variant="text" height={20} width="40%" />
                </CardContent>
                <CardActions>
                  <Skeleton variant="rectangular" height={36} width={100} />
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : error ? (
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
        ) : (
          featuredDishes.map((dish) => (
            <Grid item xs={12} sm={6} md={3} key={dish.id}>
              <Card className="dish-card">
                <CardMedia
                  component="img"
                  height="160"
                  image={dish.imageUrl || 'https://via.placeholder.com/300x200?text=Delicious+Dish'}
                  alt={dish.name}
                />
                {dish.isPopular && (
                  <Chip 
                    icon={<StarIcon />} 
                    label="Popular" 
                    color="secondary" 
                    size="small"
                    className="dish-chip"
                  />
                )}
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {dish.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="textSecondary" 
                    className="dish-description"
                  >
                    {dish.description}
                  </Typography>
                  <Typography 
                    variant="subtitle1" 
                    color="primary" 
                    className="dish-price"
                  >
                    {formatPrice(dish.price)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    component={Link}
                    to={`/menu/dish/${dish.id}`} 
                    variant="outlined" 
                    color="primary"
                    size="small"
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
      <Box textAlign="center" mt={4}>
        <Button 
          component={Link} 
          to="/menu" 
          variant="contained" 
          color="primary"
          endIcon={<ArrowForwardIcon />}
        >
          View Full Menu
        </Button>
      </Box>
    </section>
  );

  const renderCategorySection = () => (
    <section className="section">
      <Typography variant="h4" component="h2" className="section-title">
        Browse by Category
      </Typography>
      <Grid container spacing={2}>
        {loading ? (
          // Skeleton loading state
          Array.from(new Array(6)).map((_, index) => (
            <Grid item xs={6} sm={4} md={2} key={index}>
              <Skeleton variant="rectangular" height={100} />
              <Skeleton variant="text" height={24} width="60%" sx={{ mx: 'auto', mt: 1 }} />
            </Grid>
          ))
        ) : error ? null : (
          categories.map((category) => (
            <Grid item xs={6} sm={4} md={2} key={category.id}>
              <Link to={`/menu?category=${category.id}`} className="category-link">
                <Paper className="category-item">
                  <img 
                    src={category.imageUrl || 'https://via.placeholder.com/100x100?text=Category'} 
                    alt={category.name}
                    className="category-image"
                  />
                  <Typography variant="subtitle1" component="h3" align="center">
                    {category.name}
                  </Typography>
                </Paper>
              </Link>
            </Grid>
          ))
        )}
      </Grid>
    </section>
  );

  const renderBenefitsSection = () => (
    <section className="section benefits-section">
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Paper className="benefit-item">
            <DeliveryDiningIcon className="benefit-icon" />
            <Typography variant="h6" component="h3" gutterBottom>
              Fast Delivery
            </Typography>
            <Typography variant="body2">
              Our delivery partners ensure your food arrives hot and fresh within 30 minutes.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper className="benefit-item">
            <StarIcon className="benefit-icon" />
            <Typography variant="h6" component="h3" gutterBottom>
              Quality Food
            </Typography>
            <Typography variant="body2">
              We use only the freshest ingredients sourced from local suppliers.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper className="benefit-item">
            <LocalOfferIcon className="benefit-icon" />
            <Typography variant="h6" component="h3" gutterBottom>
              Special Offers
            </Typography>
            <Typography variant="body2">
              Regular promotions and discounts for our loyal customers.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </section>
  );

  const renderPromoSection = () => (
    <section className="promo-section">
      <Container>
        <Typography variant="h4" component="h2" className="promo-title">
          First Order? Get 15% Off!
        </Typography>
        <Typography variant="body1" className="promo-description">
          Use code <strong>WELCOME15</strong> at checkout to receive 15% off your first order.
        </Typography>
        <Button 
          component={Link} 
          to="/register" 
          variant="contained" 
          color="secondary" 
          size="large"
          className="promo-button"
        >
          Sign Up Now
        </Button>
      </Container>
    </section>
  );

  return (
    <div className="home-page">
      {renderHeroSection()}
      <Container>
        {renderFeaturedDishes()}
        {renderCategorySection()}
        {renderBenefitsSection()}
      </Container>
      {renderPromoSection()}
    </div>
  );
};

export default HomePage;
