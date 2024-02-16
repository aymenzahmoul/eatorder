import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { useSelector } from "react-redux";
import { store } from "../../shared";
import { setModeDelivery } from "../../shared/slice/ModalLogin/ModalLoginSlice";
import styled from "styled-components";
import AddressInput from "../AddressInput/AddressInput";
import {
    setDeliveryAdress,
    setDisable,
    setModeSelected,
    setProduct,
} from "../../shared/slice/restaurant/RestaurantSlice";
import { getProductByStoreByMode } from "../../shared/slice/restaurant/RestaurantService";
import { useNavigate } from "react-router-dom";
import { setOrder } from "../../shared/slice/order/OrderSlice";
import { resetPromo } from "../../shared/slice/promos/PromosSlice";
import { setScroll } from "../../shared/slice/scroll/ScrollSlice";

export default function ModalDelivery() {
    const [coordinates, setCoordinates] = useState({ lat: null, lon: null });
    const [location, setLocation] = useState(null);
    const [outOfRange, setOutOfRange] = useState(false);
    const modeDelivery = useSelector((state) => state.modalLogin.modeDelivery);
    const restaurantSelected = useSelector(
        (state) => state.restaurant.restaurantSelected
    );
    const modeId = useSelector((state) => state.restaurant.modeId);
    const disable = useSelector((state) => state.restaurant.disable);
    const navigate = useNavigate();
    const scroll = useSelector((state) => state.scroll.scroll);


    useEffect(() => {
        if (modeDelivery) {
            store.dispatch(setScroll({ scroll: scroll + 1 }));
        }
    }, [modeDelivery]);

    const handleGeolocationSuccess = (latitude, longitude) => {
        setCoordinates({ lat: latitude, lon: longitude });
    };
    // Calculate the distance between two sets of latitude and longitude coordinates
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth radius in kilometers
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in kilometers
        return distance;
    };

    const onSelectLocation = (selectedLocation) => {
        if (selectedLocation) {
            setCoordinates({
                lat: selectedLocation.value.lat,
                lon: selectedLocation.value.lon,
            });
            setLocation(selectedLocation);
        }
    };

    const calculateDistanceFromInput = (location) => {
        if (location) {
            const distance = calculateDistance(
                location.value.lat,
                location.value.lon,
                restaurantSelected.latitude,
                restaurantSelected.longitude
            ).toFixed(2);
            if (distance > restaurantSelected.rangeValue) {
                store.dispatch(setDisable({ disable: true }));
                setOutOfRange(true);
            } else {
                store.dispatch(setDisable({ disable: false }));
                setOutOfRange(false);
            }
        } else {
            store.dispatch(setDisable({ disable: true }));
        }
    };
    useEffect(() => {
        calculateDistanceFromInput(location);
    }, [location]);

    const handleCloseModeDelivery = () => {
        store.dispatch(setModeDelivery({ modeDelivery: false }));
        store.dispatch(setDisable({ disable: true }));
        store.dispatch(setScroll({ scroll: scroll - 1 }));
    };

    const selectMode = () => {
        if (disable) {
            setOutOfRange(true);
            return;
        } else {
            getProductByStoreByMode(restaurantSelected._id, modeId)
                .then((res3) => {
                    store.dispatch(setProduct({ product: res3 }));
                    store.dispatch(setModeSelected({ modeSelected: modeId }));
                })
                .catch((err) => {
                    console.log("Page not found");
                    navigate(`/page404`);
                });
            store.dispatch(setModeDelivery({ modeDelivery: false }));
            store.dispatch(setOrder({ order: [] }));
            store.dispatch(resetPromo());
            store.dispatch(setScroll({ scroll: scroll - 1 }));
            store.dispatch(setDeliveryAdress({ deliveryAdress: location.label }))
        }
    };

    return (
        <StyledModalDeliveryMode
            isOpen={modeDelivery}
            onRequestClose={handleCloseModeDelivery}
        >
            <div>
                <h6 style={{textAlign:'left',paddingLeft:'5px',marginBottom:'15px'}}>Enter your Delivery Adress :</h6>
                <AddressInput
                    onSelectLocation={onSelectLocation}
                    calculateDistanceFn={calculateDistanceFromInput}
                />
                {
                    <div style={{ height: "30px", fontSize:'13px', color:'red' }}>
                        {outOfRange ? "You are out of delivery range (" + restaurantSelected.rangeValue+ "Km away from store)" : null}
                    </div>
                }
                {/* {outOfRange ? <h6 className="out-of-range-message">You are out of delivery range</h6> : <div style={{ height: '27.19px' }}></div>} */}
                <SelectModeButton disable={disable} onClick={selectMode}>
                    Select Mode
                </SelectModeButton>
            </div>
        </StyledModalDeliveryMode>
    );
}

function ReactModalAdapter({ className, modalClassName, ...props }) {
    return (
        <Modal className={modalClassName} portalClassName={className} {...props} />
    );
}

const StyledModalDeliveryMode = styled(ReactModalAdapter).attrs({
    modalClassName: "ModalDeliverly",
    overlayClassName: "OverlayDelivery",
})`
  .ModalDeliverly {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    padding: 20px;
    border-radius: 15px;
    height: 250px;
    width: 400px;
    text-align: center;
  }  @media (max-width: 768px) {
    .ModalDeliverly{
        width: 90%;
        min-width:90%;
    }
}
  .OverlayDelivery {
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

const SelectModeButton = styled.button`
  color: ${(props) => (props.disable ? "#fff" : "#fff")};
  background: ${(props) => (props.disable ? "var(--primaryColorLight)" : "var(--primaryColor)")};
  border: none;
  border-radius: 25px;
  width: 90%;
  height: 40px;
  font-size: 19px;
  margin-bottom: 10px;
  cursor: ${(props) => (props.disable ? "not-allowed !important" : "pointer")};

  &:hover {
    background: ${(props) => (props.disable ? "#fff" : "#fff")};
    border: 1px solid ${(props) => (props.disable ? "var(--primaryColorLight)" : "var(--primaryColor)")};
    color: ${(props) => (props.disable ? "var(--primaryColorLight)" : "var(--primaryColor)")};
  }
`;
