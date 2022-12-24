import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard";
import Cart, { generateCartItemsFrom } from "./Cart";

const Products = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [debounceTimeOut, setDebounceTimeOut] = useState(0);
  const [filterData, setFilterdata] = useState([]);
  const token = localStorage.getItem('token');
  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.endpoint}/products`);
      setLoading(false);
      setProducts(response.data);
      setFilterdata(response.data);
      return response.data;


      // setFilterProducts(response.data);
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.status === 500) {
        enqueueSnackbar(error.response.data.message, { variant: "error" });
        return null;
      } else {
        enqueueSnackbar(
          "Could not fetch products,Check the backend console for more details",
          { variant: "error" }
        );
      }
    }
  };
  // useEffect(() => {
  //   performAPICall();
  // }, []);

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    try {
      const response = await axios.get(`${config.endpoint}/products/search?value=${text}`);
      setFilterdata(response.data);
      return response.data;
    
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          setFilterdata([]);
        }
        if (error.response.status === 500) {
          enqueueSnackbar(error.response.data.message, { variant: "error" });
          setFilterdata(products);
        }
      }
      else {
          enqueueSnackbar(
            "Could not fetch products,Check the backend console for more details",
            { variant: "error" }
          );
        }
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeOut) => {
    const value = event.target.value;
    if (debounceTimeOut) {
      clearTimeout(debounceTimeOut);
    }
    const timeOut = setTimeout(() => {
      performSearch(value);
    }, 500);
    setDebounceTimeOut(timeOut);
  };

  const fetchCart = async (token) => {
    if (!token) return;
    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    }
    catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      }
      else {
        enqueueSnackbar("Could not fetch card details.Check that backend is running", { variant: "error" });
      }
      return null;
    }
  };

  const updateCartItems = (cartData, products) => {
    const cartItems = generateCartItemsFrom(cartData, products);
    setItems(cartItems);
  };
  const isItemInCart = (items, productId) => {
    // if (items) {
    //   return items.findIndex((item) => item.productId === productId) !== -1;
    // }
    if (!items) return false;
    return items.filter((item) => item.productId === productId).length > 0 ? true : false;
  };

  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    if (!token) {
      enqueueSnackbar("Login to add an item to the Cart", { variant: "warning" });
      return;
    }
    if ( isItemInCart(items, productId) && options.preventDuplicate) {
      enqueueSnackbar("Item already in cart. Use the cart sidebar to update quantity or remove item.",
        { variant: "warning" });
      return;
    }
    try {
      const response = await axios.post(`${config.endpoint}/cart`,
        { productId, qty },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      updateCartItems(response.data, products);
    }
    catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      }
      else {
        enqueueSnackbar(
          "Could not fetch products. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    }
  };

  useEffect(() => {
    const onLoadHandler = async () => {
      const productsData = await performAPICall();
      const cartData = await fetchCart(token);
      const cartDetails = await generateCartItemsFrom(cartData, productsData);
      setItems(cartDetails);
    };
    onLoadHandler();
  }, []);


  return (
    <div>
      <Header children>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
        <TextField
          className="search-desktop"
          size="small"
          onChange={(event) => debounceSearch(event, debounceTimeOut)}
          InputProps={{
            className: "search",
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="seacrh"
        />
      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        onChange={(event) => debounceSearch(event, debounceTimeOut)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
      />
  <Grid container>
        <Grid
          item
          xs={12}
          md={token && products.length ? 9:12}
          className="product-grid"
        >
          <Box className="hero">
            <p className="hero-heading">
              India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
              to your door step
            </p>
          </Box>

          {isLoading ? (
            <Box className="loading">
              <CircularProgress />
              <h4>Loading Products...</h4>
            </Box>
          ) : (
            <Grid container marginY="1rem" paddingX="1rem" spacing={2}>
              {filterData.length ? (
                filterData.map((product) => (
                  <Grid item xs={6} md={3} key={product._id}>
                    <ProductCard
                      product={product}
                      handleAddToCart={() => {
                         addToCart(
                          token,
                          items,
                          products,
                          product._id,
                          1, {
                          preventDuplicate: true,
                        }
                        );
                      }}
                    />
                  </Grid>
                ))
              ) : (
                <Box className="loading">
                  <SentimentDissatisfied color="action" />
                  <h4 style={{ color: "#636363" }}>No products found</h4>
                </Box>
              )}
            </Grid>
          )}
        </Grid>
        {token ? (
          <Grid item xs={12} md={3} bgcolor="#E9F5E1">
            <Cart
              hasCheckoutButton
              products={products}
              items={items}
              handleQuantity={addToCart} />
          </Grid>
        ):null}
</Grid>

      <Footer />
    </div>
  );
};

export default Products;
