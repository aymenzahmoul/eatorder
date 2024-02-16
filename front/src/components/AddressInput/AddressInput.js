import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useTranslation } from "react-i18next";
const Input = styled.input`
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 10px;
`;
const InputButton = styled.div`
  display: flex;
  position: relative;
`;
const Button = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 10px;
  position: absolute;
  right: ${(props) => (props.hasSuggestions ? "-400px" : "5px")};
  top: 40%;
  transform: translateY(-50%);
`;
const List = styled.div`
  list-style-type: none;
  padding: 0;
  margin: 0;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 60%;
  position: absolute;
  z-index: 1;
  background-color: #fff;

`;
const ListItem = styled.div`
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  &:hover {
    background-color: #F9F9F9;
  }
`;
const AddressIn = styled.div`

  }
`;
const AddressInput = ({ onSelectLocation, calculateDistanceFn }) => {
  const { t } = useTranslation();

  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const MAPBOX_ACCESS_TOKEN =
    "pk.eyJ1Ijoib3Vzc2FtYTAwOSIsImEiOiJjbHJodmFkc3gwMnZ6MmtwYWVqa2x6Yjl6In0.lPX7JfDDroOFDJh_DpSFYQ";
  useEffect(() => {
    onSelectLocation(selectedLocation);
    calculateDistanceFn(selectedLocation);
  }, [selectedLocation]);


  const handleInputChange = async (value) => {
    setInputValue(value);
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          value
        )}.json?access_token=${MAPBOX_ACCESS_TOKEN}`
      );
      if (response.data.features) {
        const suggestions = response.data.features.map((feature) => ({
          label: feature.place_name,
          value: {
            lat: feature.center[1],
            lon: feature.center[0],
          },
        }));
        setOptions(suggestions);
      }
    } catch (error) {
      console.error("Error fetching location suggestions:", error.message);
    }
  };
  const handleLocationChange = (location) => {
    setInputValue(location.label);
    setSelectedLocation(location);
    setOptions([]);
    calculateDistanceFn(location);

  };
  const handleLocationChange2 = async () => {
    try {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const response = await axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_ACCESS_TOKEN}`
        );
        if (response.data.features && response.data.features.length > 0) {
          const address = response.data.features[0].place_name;
          const location = {
            label: address,
            value: { lat: latitude, lon: longitude },
          };
          setInputValue(location.label);
          setSelectedLocation(location);
          setOptions([]);
          calculateDistanceFn(location);
        }
      });
    } catch (error) {
      console.error("Error getting current location:", error.message);
    }
  };

  return (
    <AddressIn>
      <InputButton>
        <Button onClick={() => handleLocationChange2(selectedLocation)}>
          <LocationOnIcon style={{ color: "black" }} />
        </Button>
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={t('type your address')} onKeyDown={e => e.stopPropagation()}

        />
      </InputButton>
      {options.length > 0 && (
        <List>
          {options.map((option, index) => (
            <ListItem key={index} onClick={() => handleLocationChange(option)}>
              {option.label}
            </ListItem>
          ))}
        </List>
      )}
    </AddressIn>
  );
};
export default AddressInput;

