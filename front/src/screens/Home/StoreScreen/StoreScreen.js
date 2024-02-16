import React, { useEffect, useState } from 'react';
import { Banner } from '../../../components/exports';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { setRestaurant } from '../../../shared/slice/restaurant/RestaurantSlice';
import { getcompanybyid } from '../../../shared/slice/company/CompanyService';
import AddressInput from '../../../components/AddressInput/AddressInput';
import styled from 'styled-components';
import { getstorebyidcompany } from '../../../shared/slice/restaurant/RestaurantService';
import { store } from '../../../shared';
import { setOrder } from '../../../shared/slice/order/OrderSlice';
import { resetPromo } from '../../../shared/slice/promos/PromosSlice';
import { useTranslation } from 'react-i18next';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};



export default function StoreScreen() {
  const { t } = useTranslation();

  const [coordinates, setCoordinates] = useState({ lat: null, lon: null });
  const { id } = useParams();
  const navigate = useNavigate();
  const restaurants = useSelector((state) => state.restaurant.restaurant);
  const restaurantSelected = useSelector((state) => state.restaurant.restaurantSelected)

  const [FilteredRestaurants, setFilteredRestaurants] = useState([]);
  const [distances, setDistances] = useState({});
  const fetchedStores = restaurants;
  const dispatch = useDispatch();
  const [location, setLocation] = useState(null);



  useEffect(() => {
    const fetchCompanyByName = async () => {
      try {
        const res = await getcompanybyid(id);
        if (res.length > 0) {
          const storeRes = await getstorebyidcompany(id);
          dispatch(setRestaurant({ restaurant: storeRes.stores }));
          console.log(storeRes.stores);
          setFilteredRestaurants(storeRes.stores);
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


  const onSelectLocation = (selectedLocation) => {
    if (selectedLocation) {
      setCoordinates({
        lat: selectedLocation.value.lat,
        lon: selectedLocation.value.lon,
      });
      setLocation(selectedLocation); // Set the location for the useEffect
    }
  };

  const getIntoStore = (storeId) => {
    navigate(`/select-store/${storeId}`);
    if (storeId !== restaurantSelected?._id) {
      store.dispatch(setOrder({ order: [] }));
      store.dispatch(resetPromo());
    }
  };

  const calculateDistanceFromInput = (location) => {
    if (location) {

      const distancesMap = {};

      fetchedStores.forEach((store) => {
        const distance = calculateDistance(
          location.value.lat,
          location.value.lon,
          store.latitude,
          store.longitude
        ).toFixed(2);
        distancesMap[store._id] = distance;

        let sortedStores;

        if (distance > 0) {
          sortedStores = restaurants
            .map((store) => ({
              ...store,
              distance: calculateDistance(
                store.latitude,
                store.longitude,
                coordinates.lat,
                coordinates.lon
              ),
            }))
            .sort((a, b) => a.distance - b.distance);
          setFilteredRestaurants(sortedStores);
        }
      });

      setDistances(distancesMap);
    }

  };
  useEffect(() => {

    calculateDistanceFromInput(location);

  }, [location]);

  const isOpenNow = (storeRes) => {
    const { openingdate } = storeRes;
    const currentTime = new Date();
    const currentDay = currentTime.toLocaleString('en-US', { weekday: 'long' });
    const currentTimeString = currentTime.toLocaleTimeString('en-US', { hour12: false });
    return openingdate.some(({ shifts, jour }) => {
      const { start, end } = shifts;
      const isOpen = jour[currentDay]?.isOpen;
      if (!isOpen) return false;
      if (end < start) {
        const adjustedCurrentTime = new Date(currentTime);
        adjustedCurrentTime.setDate(adjustedCurrentTime.getDate() - 1);
        const adjustedCurrentTimeString = adjustedCurrentTime.toLocaleTimeString('en-US', { hour12: false });
        return currentTimeString >= start || currentTimeString <= end || adjustedCurrentTimeString >= start;
      } else {
        return currentTimeString >= start && currentTimeString <= end;
      }
    });
  };
  return (
    <>
      <Banner />
      <AdressInp>
        <AddressInput onSelectLocation={onSelectLocation} calculateDistanceFn={calculateDistanceFromInput} />
      </AdressInp>
      <StoresContainer>


        {FilteredRestaurants.map((store) => (
          <StoreCard key={store._id} onClick={() => getIntoStore(store._id)}>
            <StoreLogo src={store.logo} alt="Store Logo" />
            <StoreDetails>
              <StoreStatus>
                <h5>{store.name}</h5>
              </StoreStatus>
              <Adressp>
                <p>{store.address}</p>
              </Adressp>
              {distances[store._id] > 0 && (
                <DistanceLabel>{distances[store._id]} {t('km away')}</DistanceLabel>
                )}
            </StoreDetails>
            <ActiveStatus><h6>{isOpenNow(store) ? t('Open 🟢') : t('Closed 🔴')}</h6></ActiveStatus>
          </StoreCard>
        ))}

      </StoresContainer>
    </>
  );
}


const StoresContainer = styled.div`
  display: flex;
  flex-direction:column;
  flex-wrap: wrap;
  padding: 20px;
  align-items: center;
`;

const StoreCard = styled.div`
  width: 30%;
  height: 120px;
  margin: 10px;
  padding: 10px;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;

  @media (max-width: 768px) {
    width: 95%;
    height: 150px;
  }
`;

const StoreLogo = styled.img`
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 10px;
  margin-right: 20px;
`;

const StoreDetails = styled.div`
  flex-grow: 1;
`;

const StoreStatus = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
`;

const Adressp = styled.div`
  margin-bottom: 5px;
`;

const ActiveStatus = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
`;

const AdressInp = styled.div`
  width: 30%;
  padding: 20px 0;
  margin-left:35%;
  @media (max-width: 768px) {
    width:80%;
    margin-left:10%;
  }
`;

const DistanceLabel = styled.p`
  position: absolute;
  bottom: 5px;
  right: 5px;
  font-size: 0.8rem;
  color: #777;
`;