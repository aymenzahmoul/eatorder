import Modal from "react-modal";
import React, { useEffect, useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { setOrder } from "../../shared/slice/order/OrderSlice";
import { resetPromo } from "../../shared/slice/promos/PromosSlice";
import { store } from "../../shared";
import { createOrder } from "../../shared/slice/order/OrderService";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import StripeForm from "../StripeForm/StripeForm";
import { getMode } from "../../shared/slice/restaurant/RestaurantService";
import { useTranslation } from "react-i18next";
import * as locales from 'date-fns/locale';
const userLanguage = navigator.language || navigator.userLanguage;
const languageCode = userLanguage.split('-')[0];

const locale = locales[languageCode];

function Checkout({ modalCheckout, setModalCheckout, totalPrice }) {
    const { t } = useTranslation();

    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableTimeOptions, setAvailableTimeOptions] = useState([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const orders = useSelector((state) => state.order.order);
    const selectedPromos = useSelector((state) => state.promos.selectedPromos);
    // console.log(selectedPromos);

    const loggedInUser = useSelector(
        (state) => state.authentification.loggedInUser
    );
    const openingDate = useSelector(
        (state) => state.restaurant.restaurantSelected.openingdate
    );
    const restaurantSelected = useSelector(
        (state) => state.restaurant.restaurantSelected
    );
    const modeSelected = useSelector((state) => state.restaurant.modeSelected);
    const currency = useSelector((state) => state.restaurant.menu?.currency);
    const deliveryAdress = useSelector(
        (state) => state.restaurant.deliveryAdress
    );
    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handlePaymentMethodChange = (event) => {
        setSelectedPaymentMethod(event.target.value);
    };

    const closeCheckoutModal = () => {
        setModalCheckout(false);
        setSelectedPaymentMethod(null);
        setAvailableTimeOptions([]);
        setSelectedDate(null);
        setError(null);
    };

    const filterTime = (time) => {
        return availableTimeOptions.some(
            (option) =>
                option.getHours() === time.getHours() &&
                option.getMinutes() === time.getMinutes()
        );
    };

    const clearDate = () => {
        // console.log("Order submitted for:", selectedDate);
        setAvailableTimeOptions([]);
        setSelectedDate(null);
    };

    useEffect(() => {
        if (selectedDate) {
            const selectedDay = selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
            });
            // Filter shifts that are open on the selected day
            const shiftsForDay = openingDate.filter(
                (shift) => shift.jour[selectedDay]?.isOpen
            );
            // Generate time options based on all shifts for the selected day
            const timeOptions = [];
            shiftsForDay.forEach((shift) => {
                let currentTime = new Date(`2022-01-01T${shift.shifts.start}`);
                const endTime = new Date(`2022-01-01T${shift.shifts.end}`);

                while (currentTime < endTime) {
                    timeOptions.push(new Date(currentTime));
                    currentTime.setMinutes(currentTime.getMinutes() + 15);
                }
            });
            setAvailableTimeOptions(timeOptions);
        }
    }, [selectedDate]);

    const handlePayment = async () => {
        setLoading(true);
        setError(null);
        try {
            // Validate the card element
            const cardElement = elements.getElement(CardElement);
            if (!stripe || !cardElement) {
                throw new Error(
                    "Stripe.js has not loaded yet. Make sure your fetch is resolving after the Stripe.js load event."
                );
            }
            // Create a payment method
            const { error: stripeError, paymentMethod } =
                await stripe.createPaymentMethod({
                    type: "card",
                    card: cardElement,
                });
            console.log(paymentMethod);
            if (stripeError) {
                throw new Error(stripeError.message);
            }
            // Proceed to transfer funds
            const response = await fetch(
                "http://localhost:8000/client/transfer-funds",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        amount: totalPrice * 100,
                        paymentMethodId: paymentMethod.id,
                        connectedAccountId: restaurantSelected.stripeAccountId,
                    }),
                }
            );
            if (!response.ok) {
                throw new Error("Failed to transfer funds");
            }
            console.log("Payment succeeded:", response);
            return response.status;
        } catch (error) {
            console.error(error.message);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOrder = async () => {
        try {
            if (!selectedPaymentMethod) {
                console.error("No payment method selected. Order creation aborted.");
                return;
            }
            const mode = await getMode(modeSelected);
            if (loggedInUser) {
                let orderSchema = [];
                let PromoSchema = [];

                let myOrder = {};
                for (let i = 0; i < orders.length; i++) {
                    orderSchema[i] = {
                        description: orders[i].product.description,
                        name: orders[i].product.name,
                        id: orders[i].product.id,
                        item_price: parseFloat(orders[i].product.price).toFixed(2),
                        price: parseFloat(orders[i].price).toFixed(2),
                        quantity: orders[i].quantity,
                        size: orders[i].product.size,
                        options: orders[i].options,
                        tax: orders[i].taxes,
                    };
                }

                let price_total = 0;
                for (let i = 0; i < orders.length; i++) {
                    price_total += orders[i].price;
                }

                // promo schema + total price
                for (let i = 0; i < selectedPromos.length; i++) {
                    PromoSchema[i] = {};
                    PromoSchema[i].promoId = selectedPromos[i].promo._id;
                    PromoSchema[i].items = [];
                    for (let j = 0; j < selectedPromos[i].products.length; j++) {

                        price_total += selectedPromos[i].products[j].price_after_discount;
                        PromoSchema[i].items[j] = {
                            description: selectedPromos[i].products[j].product.description,
                            name: selectedPromos[i].products[j].product.name,
                            id: selectedPromos[i].products[j].product.id,
                            item_price: selectedPromos[i].products[j].product.price,
                            item_price_after_discount: selectedPromos[i].products[j].price_after_discount - selectedPromos[i].products[j].options.reduce((total, option) => {
                                return total + option.price;
                            }, 0),
                            subtotal: selectedPromos[i].products[j].price_after_discount,
                            quantity: selectedPromos[i].products[j].quantity,
                            size: selectedPromos[i].products[j].product.size,
                            options: selectedPromos[i].products[j].options,
                            tax: selectedPromos[i].products[j].taxes,
                        };
                    }
                }
                myOrder.items = orderSchema;
                myOrder.promo = PromoSchema;
                myOrder.price_total = parseFloat(price_total).toFixed(3);
                myOrder.client_first_name = loggedInUser.firstName;
                myOrder.client_last_name = loggedInUser.lastName;
                myOrder.client_email = loggedInUser.email;
                myOrder.client_phone = loggedInUser.phoneNumber;
                myOrder.userId = loggedInUser._id;
                myOrder.storeId = restaurantSelected._id;
                myOrder.paymentMethod = selectedPaymentMethod;
                myOrder.type = mode.mode.name;
                myOrder.currency = currency;
                myOrder.restaurantAdress = restaurantSelected.address;
                if (deliveryAdress) {
                    myOrder.deliveryAdress = deliveryAdress;
                }
                if (selectedDate) {
                    myOrder.preparedAt = selectedDate;
                }
                if (selectedPaymentMethod === "Credit/Debit Card") {
                    // Call handlePayment function
                    const paymentSuccess = await handlePayment();
                    if (paymentSuccess !== 200) {
                        console.error(
                            "Payment was not successful. Order creation aborted."
                        );
                        return;
                    }
                    myOrder.paymentStatus = "Paid";
                }

                const orderResponse = await createOrder(myOrder);
                console.log("Order created:", orderResponse);
                setModalCheckout(false);
                setSelectedPaymentMethod(null);
                setAvailableTimeOptions([]);
                setSelectedDate(null);
                store.dispatch(setOrder({ order: [] }));
                store.dispatch(resetPromo());

                // if (message) {
                //   alert(message);
                //   setMessage("");
                // } else {
                //   alert(
                //     "Your order have been sent succefully wait for confimation !"
                //   );
                // }
            }
        } catch (error) {
            console.error("Error creating order:", error);
        }
    };

    const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
        <input
            type="text"
            value={value}
            onClick={onClick}
            placeholder={t("Month D, YYYY HH:MM")}
            readOnly
            style={{ cursor: "pointer", border: "1px solid" }}
            ref={ref}
        />
    ));

    return (
        loggedInUser && (
            <div>
                <StyledModalcheckout
                    isOpen={modalCheckout}
                    onClose={() => setModalCheckout(false)} // Add onClose handler to close the modal
                    className="ModalCheckout"
                    overlayClassName="OverlayCheckout"
                >
                    <Header>{t("Checkout")}</Header>
                    <ContentWrapper>
                        <ContactInfo>
                            <Subtitle>{t("Contact")}</Subtitle>
                            <UserInfo>
                                <div>
                                    <strong>{t("Name")} :</strong> {loggedInUser.lastName}{" "}
                                    {loggedInUser.firstName}
                                </div>
                                <div>
                                    <strong>{t("Email")}:</strong> {loggedInUser.email}
                                </div>
                                <div>
                                    <strong>{t("phone number")}:</strong> {loggedInUser.phoneNumber}
                                </div>
                            </UserInfo>
                        </ContactInfo>
                        <OrderAdvance>
                            <Subtitle>{t("Order in Advance")}</Subtitle>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={handleDateChange}
                                    minDate={new Date()}
                                    maxDate={
                                        new Date(new Date().setDate(new Date().getDate() + 6))
                                    }
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={15}
                                    dateFormat="MMMM d, yyyy h:mm aa"
                                    filterTime={filterTime}
                                    customInput={<CustomInput />}
                                    locale={locale} // Set the locale to French

                                />
                                <ClearButtonTime
                                    className=""
                                    onClick={clearDate}
                                    disabled={!selectedDate || availableTimeOptions.length === 0}
                                >
                                    {t("Reset")}

                                </ClearButtonTime>
                            </div>
                        </OrderAdvance>
                        <PaymentInfo>
                            <Subtitle>{t("Payment Method")}</Subtitle>
                            <PaymentOptions>
                                <label>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cash"
                                        onChange={handlePaymentMethodChange}
                                    />
                                    💵 {t("Cash")}                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="EPT"
                                        onChange={handlePaymentMethodChange}
                                    />
                                    <PointOfSaleIcon />
                                    {t("EPT")}  
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="Credit/Debit Card"
                                        onChange={handlePaymentMethodChange}
                                    />
                                    💳 {t("Credit/Debit Card")}
                                </label>
                            </PaymentOptions>
                        </PaymentInfo>
                    </ContentWrapper>
                    {selectedPaymentMethod === "Credit/Debit Card" && (
                        <div style={{ marginLeft: "10px" }}>
                            <CardElement
                                options={{
                                    style: {
                                        base: {
                                            fontSize: "16px",
                                            color: "#424770",
                                            "::placeholder": {
                                                color: "#AAB7C4",
                                            },
                                        },
                                        invalid: {
                                            color: "#9E2146",
                                        },
                                    },
                                }}
                            />
                            {error && <div style={{ color: "red" }}>{error}</div>}
                        </div>
                    )}
                    <OrderButton onClick={handleOrder}>{t("Place Your Order")}</OrderButton>
                        <CloseButton onClick={closeCheckoutModal}></CloseButton>
                </StyledModalcheckout>
            </div>
        )
    );
}

function ReactModalAdapter({ className, modalClassName, ...props }) {
    return (
        <Modal className={modalClassName} portalClassName={className} {...props} />
    );
}

const StyledModalcheckout = styled(ReactModalAdapter).attrs({
    modalClassName: "ModalCheckout",
    overlayClassName: "OverlayCheckout",
})`
  .ModalCheckout {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    padding: 20px;
    border-radius: 15px;
    height: 600px;
    width: 400px;
    text-align: center;
  }
  @media (max-width: 768px) {
    .ModalCheckout {
      width: 100%;
      height: 100%;
    }
  }

  .OverlayCheckout {
    background: rgba(0, 0, 0, 0.2);
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }
`;
const Header = styled.h1`
  color: var(--primaryColor);
  margin-bottom: 20px;
`;

const ContentWrapper = styled.div``;

const Subtitle = styled.h4`
  margin-bottom: 10px;
  margin-top: 30px;
  width: 100%;
`;

const ContactInfo = styled.div`
  text-align: left;
`;

const UserInfo = styled.div`
  margin-bottom: 20px;
`;

const OrderAdvance = styled.div`
  text-align: left;
`;

const ClearButtonTime = styled.button`
  background: red;
  color: white;
  padding: 2px;
  border: 1px solid red;
  height: 26px;
  width: 48%;
  margin: 0;
  padding: 0;
  font-size: 14px;
  &:hover {
    background: white;
    color: red;
  }
  &:disabled {
    opacity: 0.5; /* Adjust opacity or any other styles for the disabled state */
    cursor: not-allowed; /* Change cursor to indicate the button is disabled */
  }
`;
const PaymentInfo = styled.div`
  text-align: left;
`;

const PaymentOptions = styled.div`
  label {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    input {
      margin-right: 10px;
    }
  }
`;

const OrderButton = styled.button`
  background-color: var(--primaryColor);
  color: #ffffff;
  border: none;
  border-radius: 25px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  width: 30px;
  height: 30px;
  cursor: pointer;
  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 2px;
    height: 24px;
    background: #000;
  }
  &::before {
    transform: rotate(45deg);
  }
  &::after {
    transform: rotate(-45deg);
  }
`;

export default Checkout;
