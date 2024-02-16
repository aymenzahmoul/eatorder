import React, { useEffect, useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DeleteIcon from "@mui/icons-material/Delete";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { useSelector } from "react-redux";
import { BaseURI, store } from "../../shared";
import styled from "styled-components";
import { setOrder } from "../../shared/slice/order/OrderSlice";
import getSymbolFromCurrency from "currency-symbol-map";
import {
  deletePromos,
  resetPromo,
  setSelectedPromos,
} from "../../shared/slice/promos/PromosSlice";
import { setModalPrincipal } from "../../shared/slice/ModalLogin/ModalLoginSlice";
import Checkout from "../Checkout/Checkout";
import { useTranslation } from "react-i18next";
export default function Cart() {
  const { t } = useTranslation();

  const [show, setShow] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [modalCheckout, setModalCheckout] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const currency = getSymbolFromCurrency(
    useSelector((state) => state.restaurant.menu?.currency)
  );
  const isLoggedIn = useSelector((state) => state.authentification.isLoggedIn);
  const orders = useSelector((state) => state.order.order);
  const selectedPromos = useSelector((state) => state.promos.selectedPromos);
  // console.log(selectedPromos);

  useEffect(() => {
    let total = 0;

    for (let i = 0; i < orders.length; i++) {
      total += orders[i].price;
    }

    // order.product.id
    for (let i = 0; i < selectedPromos.length; i++) {
      for (let j = 0; j < selectedPromos[i].products.length; j++) {
        const item = selectedPromos[i].products[j];
        total += item.price_after_discount;
      }
    }
    setTotalPrice(parseFloat(total.toFixed(3)));
  }, [orders, selectedPromos]);

  const addItem = (productId) => {
    const updatedOrders = orders.map((order, index) => {
      if (index === productId) {
        // Increment the quantity and update the price
        return {
          ...order,
          quantity: order.quantity + 1,
          price: order.price + order.price / order.quantity,
          price: parseFloat(
            (order.price + order.price / order.quantity).toFixed(3)
          ),
        };
      }
      return order;
    });
    store.dispatch(setOrder({ order: updatedOrders }));
  };

  const deleteItem = (productId) => {
    const updatedOrders = orders
      .map((order, index) => {
        if (index === productId) {
          // Check if quantity is greater than 1
          if (order.quantity > 1) {
            // If yes, decrement the quantity and update the price
            return {
              ...order,
              quantity: order.quantity - 1,
              price: parseFloat(
                (order.price - order.price / order.quantity).toFixed(3)
              ),
            };
          } else {
            // If quantity is 1, remove the item by not including it in the updated array
            return null;
          }
        }
        return order;
      })
      .filter(Boolean); // Remove null entries from the array
    store.dispatch(setOrder({ order: updatedOrders }));
  };

  const deletePromo = (promoIndex) => {
    // Make a copy of selectedPromos before modifying it
    let updatedPromo = [...selectedPromos];

    // Check if the promoIndex is valid
    if (promoIndex >= 0 && promoIndex < updatedPromo.length) {
      // Remove the element at the specified index
      updatedPromo.splice(promoIndex, 1);

      // console.log(updatedPromo);

      // Dispatch the action with the updated selectedPromos
      store.dispatch(deletePromos({ selectedPromos: updatedPromo }));
    } else {
      console.error(`Invalid promo index: ${promoIndex}`);
    }
  };

  const deletecart = () => {
    store.dispatch(setOrder({ order: [] }));
    store.dispatch(resetPromo());
  };

  const sumTotalInPromo = (product) => {
    let total = 0;
    for (let j = 0; j < product.products.length; j++) {
      const item = product.products[j];
      total += item.price_after_discount;
    }
    return total;
  };

  const checkout = async () => {
    if (isLoggedIn) {
      setModalCheckout(true);
      setShow(false);
    } else {
      store.dispatch(setModalPrincipal({ modalPrincipal: true }));
      setShow(false);
    }
  };

  return (
    <>
      <button onClick={handleShow} className="btn ">
        <ShoppingCartIcon style={{ color: "var(--primaryColor)" }} />
      </button>
      <StyledOffCanvas show={show} onHide={handleClose} placement="end">
        <StyledOffCanvasHeader closeButton style={{ display: "block" }}>
          <Offcanvas.Title>
          <h2>{t('Your Order')}</h2>
          </Offcanvas.Title>
          {(orders && orders.length > 0) ||
            (selectedPromos && selectedPromos.length > 0) ? (
            <TotalPrice>
              {/* <h6>
                Total Price: <span className="price-value">{totalPrice}</span>
              </h6> */}
              <CommanderButton onClick={checkout}>
              {t("Checkout")} {currency}
                {parseFloat(totalPrice).toFixed(2)}
              </CommanderButton>
              <ClearCart onClick={deletecart}>
                <DeleteIcon />
              </ClearCart>
            </TotalPrice>
          ) : null}
        </StyledOffCanvasHeader>
        <StyledOffCanvasBody>
          {/* {!(orders && orders.length > 0 && selectedPromos && selectedPromos.length > 0) && <p>No orders in the cart</p>} */}
          {orders &&
            orders.length > 0 &&
            orders.map((order, index) => (
              <OrderItem key={order.product.id}>
                <OrderHeader>
                  <div>
                    <ItemImage
                      src={`${BaseURI}/${order.product.image}`}
                    ></ItemImage>
                  </div>
                  <ItemQuantity>
                    {order.quantity > 1 ? (
                      <button className="btn" onClick={() => deleteItem(index)}>
                        <RemoveCircleIcon />
                      </button>
                    ) : (
                      <button className="btn" onClick={() => deleteItem(index)}>
                        <DeleteIcon />
                      </button>
                    )}

                    <button className="btn">{order.quantity} </button>
                    <button className="btn " onClick={() => addItem(index)}>
                      <AddCircleIcon />
                    </button>
                  </ItemQuantity>
                </OrderHeader>
                <ItemName>
                  <h5>{`${order.product.name} ${order.product.size !== "S" ? `(${order.product.size})` : ""
                    }`}</h5>
                  <h5>
                    {currency}
                    {parseFloat(order.product.price).toFixed(2)}
                  </h5>
                </ItemName>

                <ProductPanierDescription>
                  {order.product.description}
                </ProductPanierDescription>
                {order.options.length > 0 ? (
                  <Options>
                    {order.options.map((option, index) => (
                      <div key={index}>
                        {index === 0 ||
                          option.optionGroupeName !==
                          order.options[index - 1].optionGroupeName ? (
                          <OptionsHeading>
                            {option.optionGroupeName}
                          </OptionsHeading>
                        ) : null}
                        <ProductOptions>
                          <Option>{option.name}</Option>
                          {option.price > 0 ? (
                            <Option>
                              {currency}
                              {parseFloat(option.price).toFixed(2)}
                            </Option>
                          ) : null}
                        </ProductOptions>
                      </div>
                    ))}
                  </Options>
                ) : null}
                <PriceContainer>
                  <h5>Total :</h5>
                  <h5>
                    {currency}
                    {parseFloat(order.price).toFixed(2)}
                  </h5>
                </PriceContainer>
              </OrderItem>
            ))}

          {selectedPromos &&
            selectedPromos.length > 0 &&
            selectedPromos.map((product, ind) => (
              <PromoContainer key={product.promo._id}>
                <PromoDeleteButton>
                  <button onClick={() => deletePromo(ind)}>
                    <DeleteIcon />
                  </button>
                </PromoDeleteButton>
                <PromoTitle key={ind}> {product.promo.name}</PromoTitle>

                {product.products.map((order, index) => (
                  <div key={order.product.id}>
                    <OrderHeader>
                      <div>
                        <ItemImage
                          src={`${BaseURI}/${order.product.image}`}
                        ></ItemImage>
                      </div>
                      {/* <ItemQuantity>
                        {order.quantity > 1 ? (
                          <button
                            className="btn "
                            onClick={() => deleteItem(index)}
                          >
                            <RemoveCircleIcon />
                          </button>
                        ) : (
                          <button
                            className="btn"
                            onClick={() => deleteItem(index)}
                          >
                            <DeleteIcon />
                          </button>
                        )}
                        <button onClick={() => deletePromo(ind)}>
                          <DeleteIcon />
                        </button>

                        <button className="btn">{order.quantity} </button>
                        <button className="btn " onClick={() => addItem(index)}>
                          <AddCircleIcon />
                        </button>
                      </ItemQuantity> */}
                    </OrderHeader>
                    <ItemName>
                      <h5>{`${order.product.name} ${order.product.size !== "S"
                          ? `(${order.product.size})`
                          : ""
                        }`}</h5>
                      <h5>
                        {order.price_after_discount !== order.price &&
                          product.promo.discount === 100 ? (
                          <span>Free</span>
                        ) : order.price_after_discount !== order.price ? (
                          <>
                            <span
                              style={{
                                textDecorationLine: "line-through",
                                marginRight: "5px",
                                color: "#a6a6a6",
                              }}
                            >
                              {`${currency}${parseFloat(
                                order.product.price
                              ).toFixed(2)}`}
                            </span>
                            <span>
                              {`${currency}${parseFloat(
                                order.product.price -
                                (order.product.price *
                                  product.promo.discount) /
                                100
                              ).toFixed(2)}`}
                            </span>
                          </>
                        ) : (
                          `${currency}${parseFloat(order.product.price).toFixed(
                            2
                          )}`
                        )}
                      </h5>
                    </ItemName>

                    <ProductPanierDescription>
                      {order.product.description}
                    </ProductPanierDescription>
                    {order.options.length > 0 ? (
                      <Options>
                        {order.options.map((option, index) => (
                          <div key={index}>
                            {index === 0 ||
                              option.optionGroupeName !==
                              order.options[index - 1].optionGroupeName ? (
                              <OptionsHeading>
                                {option.optionGroupeName}
                              </OptionsHeading>
                            ) : null}
                            <ProductOptions>
                              <Option>{option.name}</Option>
                              {option.price > 0 ? (
                                <Option>
                                  {currency}
                                  {parseFloat(option.price).toFixed(2)}
                                </Option>
                              ) : null}
                            </ProductOptions>
                          </div>
                        ))}
                      </Options>
                    ) : null}
                    <PriceContainer>
                      <h6>SubTotal :</h6>
                      <h6>
                        {currency}
                        {parseFloat(order.price_after_discount).toFixed(2)}
                      </h6>
                    </PriceContainer>
                    <hr />
                  </div>
                ))}
                <PriceContainer>
                  <h5> Total :</h5>
                  <h5>
                    {currency}
                    {parseFloat(sumTotalInPromo(product, ind)).toFixed(2)}
                  </h5>
                </PriceContainer>
              </PromoContainer>
            ))}
        </StyledOffCanvasBody>
      </StyledOffCanvas>
      <Checkout
        modalCheckout={modalCheckout}
        setModalCheckout={setModalCheckout}
        totalPrice={totalPrice}
      />
    </>
  );
}

const StyledOffCanvas = styled(Offcanvas)`
  background-color: #f5f5f5;
  border-radius: 20px 0 0 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  position: fixed;
  top: 0;
  right: 0;
  transform: translateX(100%);
  transition: transform 0.3s ease-in-out;
  @media (max-width: 768px) {
    background-color: #f5f5f5;
    border-radius: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    position: fixed;
    top: 0;
    right: 0;
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    width: 90% !important;
  }
`;

const StyledOffCanvasHeader = styled(Offcanvas.Header)`
  padding: 20px;
  border-bottom: 1px solid #ccc;
  background-color: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);

  .btn-close {
    position: absolute;
    top: 25px;
    right: 35px;
  }
`;

const StyledOffCanvasBody = styled(Offcanvas.Body)`
  padding: 20px;
  background-color: #e6e6e6;
`;

const PriceValue = styled.span`
  color: var(--primaryColor);
`;

const CommanderButton = styled.button`
  // background-color: var(--primaryColor);
  background:var(--primaryColor);
  color: #fff;
  border: none;
  border-radius: 15px;
  font-size: 18px;
  margin-left: 10px;
  padding: 10px;
  &:hover {
    background-color: var(--primaryColorLight);
  }
`;

/* Order item styles */

const OrderItem = styled.div`
  margin-bottom: 20px;
  border-radius: 25px;
  background-color: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  padding: 20px;
`;

const OrderHeader = styled.div`
  display: flex;
  flex-direction: column-reverse;
  justify-content: space-between;
  align-items: center;
  text-align: center;
`;

const ItemName = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ItemImage = styled.img`
  width: 150px;
  height: 100px;
  object-fit: contain;
  margin-bottom: 15px;
`;

const ItemQuantity = styled.div`
  box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px,
    rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
  border-radius: 25px;
  height: 40px;
  width: 60%;
  margin-right: 40%;
  margin-bottom: 15px;
`;

const ProductPanierDescription = styled.p`
  font-size: 14px;
  font-style: italic;
  margin-bottom: 10px;
  color: #666;
`;

const Options = styled.div`
  margin-bottom: 10px;
`;

const ProductOptions = styled.div`
  display: flex;
  justify-content: space-between;
`;

const OptionsHeading = styled.h6`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const Option = styled.p`
  font-size: 14px;
  font-style: italic;
  margin-bottom: 5px;
  color: #666;
`;

const PriceContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: end;
`;

const ClearCart = styled.div`
  display: flex;
  align-items: flex-end;
  color: #fff;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  background-color: #dc3545;
  border-color: #dc3545;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  &:hover {
    color: #fff;
    background-color: #c82333;
    border-color: #bd2130;
    cursor: pointer;
  }
`;

const TotalPrice = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  border-radius: 10px;
  background-color: #fff;
  width: 100%;
  font-weight: bold;
`;

const PromoTitle = styled.h6`
  margin-left: 3px;
  font-size: 20px;
  border-radius: 10px;
  padding: 5px;
  text-align: center;
`;

const PromoContainer = styled.div`
  margin-bottom: 20px;
  border-radius: 25px;
  background-color: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  padding: 20px;
`;

const PromoDeleteButton = styled.div`
  box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px,
    rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
  width: 40%;
  border-radius: 25px;
  text-align: center;
  padding: 6px;
  margin-bottom: 10px;
`;
