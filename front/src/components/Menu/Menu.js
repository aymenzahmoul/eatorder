import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { BaseURI } from "../../shared";
import styled from "styled-components";
import tw from "twin.macro";
import getSymbolFromCurrency from "currency-symbol-map";
import { StyledNavbar } from "../Navbar/MyNavBar";
import ProductModal from "./productModal/ProductModal";
import Promo from "../Promo/Promo";
import { PromoImage } from "../../assets/images/exports";
import Container from "react-bootstrap/Container";
import { useTranslation } from "react-i18next";
// import "./menu.css"
export default function Menu() {
  const { t } = useTranslation();
  const [openModal, setOpenModal] = useState({
    product: undefined,
    open: false,
  });

  const ref = useRef(null);
  const menu = useSelector((state) => state.restaurant.menu);
  const promo = useSelector((state) => state.promos.promos);
  const categories = menu?.categorys;
  const products = useSelector((state) => state.restaurant.product);

  // get the first modal
  const handleProductClick = (productId) => {
    const product = products.find((product) => product._id === productId);
    setOpenModal({
      product: product,
      open: true,
    })
  }

  function scrollToElement(id) {
    const element = document.getElementById(id);

    if (element) {
      let offset;

      if (window.innerWidth < 1023) {
        // For mobile devices, consider both navbar and sidebar height
        offset = element.offsetTop - (56 + 73.5 + 75);
      } else {
        // For desktop devices, consider only navbar height
        offset = element.offsetTop - (73.5 + 75);
      }

      window.scrollTo({
        top: offset,
        behavior: "smooth",
      });
    }
  }

  return (
    categories &&
    products && (
      <Container>
        <HomeConatainer>
          <ContainerCategories ref={ref}>
            <StickyDiv>
              {promo && <CategoryWrapper

                onClick={() => scrollToElement(promo[0]?._id)}
              >
                <CategoryImage src={PromoImage} />
                <CategoryName>{t('Our promos')}</CategoryName>
              </CategoryWrapper>}
              {categories.map((category, index) => (
                <CategoryWrapper
                  key={index}
                  onClick={() => scrollToElement(category._id)}
                >
                  <CategoryImage src={`${BaseURI}/${category.image}`} />
                  <CategoryName>{category.name}</CategoryName>
                </CategoryWrapper>
              ))}
            </StickyDiv>
          </ContainerCategories>
          <AllProducts>
            <Promo />
            <div>

              {categories.map((category) => (
                <div key={category._id} id={category._id}>
                  <ProductCategories>{category.name}</ProductCategories>
                  <ProductDetails>
                    {products.map((product, index) =>
                      categories &&
                        products &&
                        category._id === product.category ? (
                        category.availability &&
                          product.availabilitys.length > 0 &&
                          product.availabilitys[0].availability &&
                          product.availability ? (
                          <ProductCard key={product._id} onClick={() => handleProductClick(product._id)}>
                            <ProductImage
                              src={`${BaseURI}/${product.image}`}
                              alt={product.name}
                            />
                            <Wrapper>


                              <StyledContent>
                                <ProductTitle>{product.name}</ProductTitle>
                                <ProductDescription>
                                  {product.description.length > 55
                                    ? `${product.description.substring(0, 55)}...`
                                    : product.description}
                                </ProductDescription>


                              </StyledContent>
                              <div>
                                <ProductPrice>
                                  {product.size.length === 1 ? null : "From "}
                                  {getSymbolFromCurrency(menu.currency)}
                                  {parseFloat(product?.size[0]?.price).toFixed(2)}
                                </ProductPrice>
                              </div>
                            </Wrapper>
                          </ProductCard>
                        ) : (
                          <ProductCardDisabled
                            key={product._id}

                          >
                            {/* <SoldTag>Unavailable</SoldTag> */}

                            <ProductImagedisabled
                              src={`${BaseURI}/${product.image}`}
                              height="250px"
                              alt={product.name}
                            />
                            <Wrapper>

                              <StyledContent>

                                <ProductTitle>{product.name}</ProductTitle>

                                <ProductDescription>
                                  {product.description.length > 55
                                    ? `${product.description.substring(0, 55)}...`
                                    : product.description}
                                </ProductDescription>
                              </StyledContent>
                              <div>

                                <ProductPrice>
                                  {product.size.length === 1 ? null : "From"}
                                  {getSymbolFromCurrency(menu.currency)}
                                  {parseFloat(product?.size[0]?.price).toFixed(2)}
                                </ProductPrice>
                              </div>
                            </Wrapper>
                          </ProductCardDisabled>
                        )
                      ) : null
                    )}
                  </ProductDetails>
                </div>
              ))}
            </div>
          </AllProducts>
          {openModal.open && (
            <ProductModal openModal={openModal} setOpenModal={setOpenModal} />
          )}

        </HomeConatainer>
      </Container>
    )
  );
}

const HomeConatainer = styled.div`
  display: flex;
  @media (max-width: 768px) {
    display:block;
    margin-left: 0;
  }
  @media (min-width: 768px) and (max-width: 1023px) {
    display:block;
    margin-left: 0;
`;
//sidebar
const ContainerCategories = styled.div`
  width: 20%;
  margin-right: 5%;
    // border:1px solid;
  @media (min-width: 1024px) {
    max-width: 250px;
    
  }

  @media (max-width: 768px) {
    width: 100%;
    overflow-x: auto;
    position: sticky;
    top: 127px;
    background: #fff;
    z-index: 2;
  }

  @media (min-width: 768px) and (max-width: 1023px) {
    width: 100%;
    overflow-x: auto;
    position: sticky;
    top: 120px;
    background: #fff;
    z-index: 2;
  }
`;

const StickyDiv = styled.div`
  position: sticky;
  top: 13%;

  @media (max-width: 768px) {
   display:flex;
   border-bottom:1px solid rgba(0, 0, 0, 0.1);
  }
  @media (min-width: 768px) and (max-width: 1023px) {
    
    display:flex;
`;

const CategoryWrapper = styled.a`
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  margin-bottom: 5px;
  text-decoration:none;
  
  @media (max-width: 768px) {

   justify-content:center; 
   margin-right: 20px;
   margin-left: 20px;  
   border-bottom:none;
  }
  @media (min-width: 768px) and (max-width: 1023px) {
    border-bottom:none;
    justify-content:center; 
 
`;

const CategoryImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: contain;
  margin-right: 10px;
`;

const CategoryName = styled.p`
  font-weight: bold;
  font-size: 18px;
  text-transform: capitalize;
  color: #000;
`;

//products

const AllProducts = styled.div`
  width: 80%;
   @media (max-width: 768px) {
    width: 100%;
  }
  @media (min-width: 768px) and (max-width: 1023px) {
    width: 100%;
  }
`;
const ProductCategories = styled.h2`
  text-transform: capitalize;
  font-size: 30px;
  margin: 20px;
`;

const ProductDetails = styled.div`
  ${tw`text-center font-bold `}
  display:flex;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    margin-left: 3%;
  }
`;
const ProductCard = styled.div`

  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
    rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
  padding-right: 1%;
  padding-left: 1%;
  padding-bottom:1%;
  width: 200px;
  height: 275px;
  margin: 15px;
  @media (max-width: 768px) {
    width: 43%;
    margin: 10px;
    height: auto;
  }
  &:hover {
    background-color: #f6f6f6;
    cursor: pointer;
  }
`;

const ProductImage = styled.img`
  object-fit: contain;
  height: 150px;
  width: 100%;
`;

const StyledContent = styled.div`
  ${tw`py-4`}
`;
const Wrapper = styled.div`
display:flex;
flex-direction:column;
justify-content:space-between;
`
const ProductTitle = styled.div`
  ${tw`font-bold capitalize`}
`;

const ProductDescription = styled.p`
  // ${tw`text-gray-700 text-sm text-left`}
  ${tw`text-left`}
  width: 100%;
  max-width: 300px; /* Adjust the value as needed */
  word-wrap: break-word;
  font-style: italic;
    color: #666666;
    padding-left: 2%;
    font-size:13px;
    @media (max-width: 768px) {
      font-size:12px;
    }

`;

const ProductPrice = styled.p`
  float: right;
  font-size: 18px;
  font-weight: bold;
  font-style: italic;
  margin-right: 5px;
`;

const ProductCardDisabled = styled.div`
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
    rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
  padding-left: 1%;
  padding-right: 1%;
  padding-bottom:1%;
  width: 200px;
  height: 275px;
  margin: 15px;
  @media (max-width: 768px) {
    width: 43%;
    margin: 10px;
    height:auto;
  }
  &:hover {
    background-color: #f6f6f6;
    cursor: pointer;
  }
`;
const SoldTag = styled.div`
  position: relative;
  top: 10px;
  right: 10px;
  background-color: #f00;
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  font-weight: bold;
  z-index: 1;
  font-family: Cambria, Cochin, Georgia, Times, "Times New Roman", serif;
  font-size: 12px;
`;
const ProductImagedisabled = styled.img`
  object-fit: contain;
  height: 150px;
  opacity: 0.6;
  pointer-events: none;
  box-shadow: none;
  filter: grayscale(100%);
  transition: opacity 0.3s ease-in-out;
  color: #888;
  cursor: not-allowed;
  pointer-events: none;
  width: 100%;
`;
