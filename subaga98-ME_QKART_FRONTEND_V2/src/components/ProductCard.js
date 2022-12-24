import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  return (
    <Card className="card">
      <CardMedia component="img" style={{ height : "300 px" }} alt={product.name} image={product.image}/>
        <CardContent>
          <Typography color="textPrimary" variant="h6">{product.name}</Typography>
          <Typography color="textSecondary" variant="subtitle2" padding="0.5rem" fontWeight="700" >${product.cost}</Typography>
          <Rating name="read-only" value={product.rating} readOnly />
      </CardContent>
      <CardActions className="card-actions">
        <Button className='card-button' variant='contained' fullWidth onClick={handleAddToCart} startIcon={<AddShoppingCartOutlined />}> ADD TO CART </Button>
        </CardActions>
    </Card>
  );
};

export default ProductCard;
