import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getpromosbystoreid } from "../../shared/slice/promos/PromosService";
import { BaseURI, store } from "../../shared";
import {
    setPromos,
    setSelectedPromos,
} from "../../shared/slice/promos/PromosSlice";

import { PromoModal } from "./PromoModal/PromoModal";
import styled from "styled-components";
import { setScroll } from "../../shared/slice/scroll/ScrollSlice";
import { useTranslation } from "react-i18next";

export default function Promo() {
    const { t } = useTranslation(); 

    const scroll = useSelector((state) => state.scroll.scroll)
    const storeId = useSelector(
        (state) => state.restaurant.restaurantSelected._id
    );

    const promos = useSelector((state) => state.promos.promos);
    const modeSelected = useSelector((state) => state.restaurant.modeSelected);

    useEffect(() => {
        const fetchPromos = async () => {
            try {
                const res = await getpromosbystoreid(storeId, modeSelected);
                store.dispatch(setPromos({ promos: res.promos }));
            } catch (err) {
                console.log(err);
            }
        };
        fetchPromos();
    }, [modeSelected, storeId]);

    const [selectedPromo, setSelectedPromo] = useState({
        state: false,
        promo: undefined,
        products: [{ product: undefined, selected: false }],
    });

    return (
        <div>
            {selectedPromo.state && (
                <PromoModal
                    selectedPromo={selectedPromo}
                    setSelectedPromo={setSelectedPromo}
                />
            )}
            <div
                id={promos[0]?._id}
                style={{
                    margin: "20px",
                    fontSize: "30px",
                }}
            >
{t('Our promos')}            </div>
            <Container>
                <PromoStyled>
                    {promos.map((promo) => (
                        <PromoItem

                            key={promo._id}
                            onClick={() => {
                                setSelectedPromo({
                                    ...selectedPromo,
                                    promo: promo,
                                    state: true,

                                });
                                store.dispatch(setScroll({ scroll: scroll + 1 }));

                            }}
                        >
                            <PromoImage src={`${BaseURI}/${promo.image}`} alt={promo.name} />
                        </PromoItem>
                    ))}
                </PromoStyled>
            </Container>
        </div>
    );
}

const Container = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const PromoStyled = styled.div`
  display: flex;
`;

const PromoItem = styled.div`
  display: flex;
  justify-content: center;
`;

const PromoImage = styled.img`
  margin-right: 10px;
  margin-left:20px;
  max-width:200px;
  @media (max-width: 768px) {
    max-width: 150px;
  }
`;
