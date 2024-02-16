import React, { useState } from "react";
import { useSelector } from "react-redux";
import PlaceIcon from "@mui/icons-material/Place";
import CallIcon from "@mui/icons-material/Call";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import { Icon } from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
export default function DateModel() {
    const { t } = useTranslation();

    const store = useSelector((state) => state.restaurant.restaurantSelected);

    const [isOpened, setIsOpened] = useState(true);
    const handleToggle = () => {
        setIsOpened(!isOpened);
    };

    const customIcon = new Icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/2776/2776000.png",
        iconSize: [38, 38],
    });

    const daysOfWeek = [
        t('Monday') ,
        t("Tuesday"),
        t("Wednesday"),
        t("Thursday"),
        t("Friday"),
        t("Saturday"),
        t("Sunday"),
    ];

    return (
        <div>
            <StoreInformation>
                {isOpened ? (
                    <StoreLocation>
                        {store.latitude && store.longitude && (
                            <MapContainer
                                center={[store.latitude, store.longitude]}
                                zoom={15}
                                style={{ height: "200px", width: "100%" }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    key={`${store.latitude}-${store.longitude}`}
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker
                                    position={[store.latitude, store.longitude]}
                                    icon={customIcon}
                                />
                            </MapContainer>
                        )}
                        <div style={{ borderBottom: "1px solid #a7a7a" }}>
                            <button className="btn" style={{ textAlign: "start", color:'var(--primaryColor)' }}>
                                <PlaceIcon style={{ marginRight: "20px" }} />
                                {store.address}
                            </button>
                        </div>
                        <div style={{ borderBottom: "1px solid #a7a7a" }}>
                            <button
                                onClick={handleToggle}
                                className="btn"
                                style={{ textAlign: "start", color:'var(--primaryColor)' }}
                            >
                                <AccessTimeFilledIcon style={{ marginRight: "20px" }} />
                                {t('Service Hours')}    
                            </button>
                        </div>
                        <div>
                            <button className="btn " style={{ textAlign: "start", color:'var(--primaryColor)' }}>
                                <CallIcon style={{ marginRight: "20px" }} />
                                <StoreTel href={`tel:${store.phoneNumber}`} style={{color:'var(--primaryColor)'}}>
                                    {store.phoneNumber}
                                </StoreTel>
                            </button>
                        </div>
                    </StoreLocation>
                ) : (
                    <OpeningHoursContainer>
                        <ServiceHoursContainer>
                            <button className="btn">
                                <AccessTimeFilledIcon
                                    style={{ color: "#fff", marginRight: "20px" }}
                                />
                                    {t('Service Hours')}    
                            </button>
                            <button className="btn" onClick={handleToggle}>
                                <CloseIcon />
                            </button>
                        </ServiceHoursContainer>
                        {daysOfWeek.map((day) => (
                            <DayContainer key={day}>
                                <Day>{day}</Day>
                                <Hours>
                                    {store.openingdate.map((entry, index) =>
                                        entry.jour[day]?.isOpen && entry.shifts ? (
                                            <Shifts
                                                key={index}
                                            >{`${entry.shifts.start} - ${entry.shifts.end} `}</Shifts>
                                        ) : null
                                    )}
                                    {!store.openingdate.some(
                                        (entry) => entry.jour[day]?.isOpen
                                    ) && (
                                            <p className="shifts" key="closed">
                                                     {t('Closed')}
                                            </p>
                                        )}
                                </Hours>
                            </DayContainer>
                        ))}
                    </OpeningHoursContainer>
                )}
            </StoreInformation>
        </div>
    );
}

const StoreInformation = styled.div`
display: flex;
justify-content: space-around;
max-width:1200px;
@media screen and (max-width: 768px) {
      flex-direction: column;
      align-content: center;
      justify-content: center;
`;

const StoreLocation = styled.div`
  width: 100%;
  border: 1px solid #a7a7a7;
  padding: 2px;
  border-radius: 7px;
  margin-bottom: 10px;
  height: 360px;
`;

const StoreTel = styled.a`
  text-decoration: none;
  color: #000;
`;
const OpeningHoursContainer = styled.div`
//   width: 100%;
  border: 2px solid #a7a7a7;
  /* padding: 2px; */
  border-radius: 7px;
  margin-bottom: 10px;
  height: 360px;
`;
const ServiceHoursContainer = styled.div`
  background: var(--primaryColor);
  border-radius: 4.5px 4.5px 0 0;
  display: flex;
  justify-content: space-between;
`;

const DayContainer = styled.div`
  display: flex;
  justify-content: space-between;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  align-items: center;
  margin: 5px 5px 5px 0;
  height: 40px;
  width: 350px;
`;
const Day = styled.h6`
  margin: 0px 0px 0px 8px;
`;

const Hours = styled.div`
  display: flex;
  margin-left: 10px;
`;

const Shifts = styled.p`
  margin: 0 0 0 auto;
  margin-left: 10px;
  margin-right: 7px;
  padding-right: 5px;
  font-size: 14px;
  font-weight: bold;
`;
