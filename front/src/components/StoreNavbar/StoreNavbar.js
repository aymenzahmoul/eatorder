import React, { useEffect } from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import StoreIcon from "@mui/icons-material/Store";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import {
  getMenuByStore,
  getModeConsomation,
  getProductByStoreByMode,
  getStoreById,
} from "../../shared/slice/restaurant/RestaurantService";
import { store } from "../../shared";
import {
  setMenu,
  setMode,
  setModeId,
  setModeSelected,
  setProduct,
  setRestaurant,
  setRestaurantSelected,
} from "../../shared/slice/restaurant/RestaurantSlice";
import { useNavigate } from "react-router-dom";
import ModalDelivery from "../Modals/ModalDelivery";
import { setModeDelivery } from "../../shared/slice/ModalLogin/ModalLoginSlice";
import { setOrder } from "../../shared/slice/order/OrderSlice";
import { resetPromo } from "../../shared/slice/promos/PromosSlice";
import { getcompanybyid } from '../../shared/slice/company/CompanyService';
import { getstorebyidcompany } from '../../shared/slice/restaurant/RestaurantService';
import { lighten } from "polished";

export default function StoreNavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const restaurants = useSelector((state) => state.restaurant.restaurant);
  const restaurantSelected = useSelector(
    (state) => state.restaurant.restaurantSelected
  );
  const modes = useSelector((state) => state.restaurant.mode);
  const modeSelected = useSelector((state) => state.restaurant.modeSelected);


  useEffect(() => {
    const fetchCompanyByName = async () => {
      try {
        const res = await getcompanybyid(restaurantSelected.companyId);
        if (res.length > 0) {
          const storeRes = await getstorebyidcompany(restaurantSelected.companyId);
          dispatch(setRestaurant({ restaurant: storeRes.stores }));
        } else {
          console.log('Page not found');
          navigate(`/page404`);
        }
      } catch (err) {
        console.error("Error fetching company by ID:", err);
      }
    };

    fetchCompanyByName();
  }, []);

  const handleStoreSelectorChange = (storeId) => {
    navigate(`/select-store/${storeId}`)
    const fetchedStoresById = async () => {
      await getStoreById(storeId)
        .then(async (res) => {
          store.dispatch(setRestaurantSelected({ restaurantSelected: res }));
          store.dispatch(setModeSelected({ modeSelected: res.defaultMode }));
          document.documentElement.style.setProperty("--primaryColor", res.primairecolor);
          document.documentElement.style.setProperty(
              "--primaryColorLight",
              lighten("0.3", res.primairecolor)
          );
          await getMenuByStore(storeId)
            .then((res1) => {
              store.dispatch(setMenu({ menu: res1 }));
            })
            .catch((err) => {
              console.log("Page not found");
              navigate(`/page404`);
            });
          await getModeConsomation(res._id)
            .then((res4) => {
              store.dispatch(setMode({ mode: res4.consumationModes }));
            })
            .catch((err) => {
              console.log("Page not found");
              navigate(`/page404`);
            });

          await getProductByStoreByMode(storeId, res.defaultMode)
            .then((res3) => {
              store.dispatch(setProduct({ product: res3 }));
            })
            .catch((err) => {
              console.log("Page not found");
              navigate(`/page404`);
            });
        })
        .catch((err) => {
          console.log("Page not found");
          navigate(`/page404`);
        });
    };
    store.dispatch(setOrder({ order: [] }));
    store.dispatch(resetPromo());
    fetchedStoresById();
  };

  const handleModeSelectorChange = (mode) => {
    const isLivraisonMode =
      modes.find((m) => m.mode._id === mode)?.mode.name === "Delivery";
    if (isLivraisonMode) {
      store.dispatch(setModeDelivery({ modeDelivery: true }));
    } else {
      getProductByStoreByMode(restaurantSelected._id, mode)
        .then((res3) => {
          store.dispatch(setProduct({ product: res3 }));
          store.dispatch(setModeSelected({ modeSelected: mode }));
        })
        .catch((err) => {
          console.log("Page not found");
          navigate(`/page404`);
        });
      store.dispatch(setOrder({ order: [] }));
      store.dispatch(resetPromo());
    }
    store.dispatch(setModeId({ modeId: mode }));
  };

  const storeSelector = (
    <>
      <SelectorStyled
        value={restaurantSelected._id || ""}
        onChange={(e) => handleStoreSelectorChange(e.target.value)}
      >
        {/* <option value="" disabled>
          {restaurantSelected.name}
        </option> */}

        {restaurants.map((store) => (
          <option key={store._id} value={store._id}>
            {store.name}
          </option>
        ))}
      </SelectorStyled>
      {/* <span style={{ color: "var(--primaryColor", margin: "0", padding: "0" }}>
        ▼
      </span> */}
    </>
  );

  const modeSelector = (
    <>
      <SelectorStyled
        value={modeSelected || ""}
        onChange={(e) => handleModeSelectorChange(e.target.value)}
      >
        {modes.map((mode) => (
          <option key={mode.mode._id} value={mode.mode._id}>
            {mode.mode.name}
          </option>
        ))}
      </SelectorStyled>
      {/* <span style={{ color: "var(--primaryColor", margin: "0", padding: "0" }}>
        ▼
      </span> */}
    </>
  );

  return (
    // <Container>
    <NavbarContainer>
      <NavItem>
        <NavLink>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              color: "var(--primaryColor)",
              border: "2px solid var(--primaryColor)",
              borderRadius: "18px",
              background: "var(--primaryColor)",
              color: "#fff",
              marginRight: "10px",
            }}
          >
            <StoreIcon />
            {storeSelector}
          </span>
        </NavLink>
      </NavItem>
      <NavItem>
        <NavLink>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              color: "var(--primaryColor)",
              border: "2px solid var(--primaryColor)",
              borderRadius: "18px",
              background: "var(--primaryColor)",
              color: "#fff",
            }}
          >
            <RestaurantIcon />
            {modeSelector}
          </span>
          <ModalDelivery />
        </NavLink>
      </NavItem>
    </NavbarContainer>
    // {/* </Container> */}
  );
}

const NavbarContainer = styled.div`
  display: flex;
  justify-content: center;
  position: sticky;
  top: 54px;
  z-index: 1001;
  background: #fff;
  margin-left: 20%;
  padding: 15px;
  @media (max-width: 1023px) {
    margin-left: 0;
  }
`;

const NavItem = styled.div``;

const NavLink = styled.div`
  text-decoration: none;
`;

const SelectorStyled = styled.select`
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding: 10px;
  // border: 2px solid var(--primaryColor);
  outline: none;
  border-radius: 15px;
  background-color: #fff;
  color: var(--primaryColor);
  font-size: 13px;
  cursor: pointer;
  padding-right: 0px;
  width: 150px;
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const StoreNavbarStyled = styled(Navbar)`
  @media (max-width: 768px) {
    width: 100%;
    text-align: center;
  }
`;
const StoreNavbarItem = styled(Navbar)`
  @media (max-width: 768px) {
    width: 50%;
    display: inline-block;
  }
`;
