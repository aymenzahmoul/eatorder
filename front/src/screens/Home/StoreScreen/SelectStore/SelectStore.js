import React, { useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import InformationStore from '../../../../components/Menu/InformationStore';
import { setMenu, setMode, setModeSelected, setProduct, setRestaurantSelected } from '../../../../shared/slice/restaurant/RestaurantSlice';
import { getMenuByStore, getModeConsomation, getProductByStoreByMode, getStoreById } from '../../../../shared/slice/restaurant/RestaurantService';
import Menu from '../../../../components/Menu/Menu';
import MyNavBar from '../../../../components/Navbar/MyNavBar';
import StoreNavbar from '../../../../components/StoreNavbar/StoreNavbar';
import { lighten } from "polished";


export default function SelectStore() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const restaurantSelected = useSelector((state) => state.restaurant.restaurantSelected);
    // const menu = useSelector((state) => state.restaurant.menu);
    // const products = useSelector((state) => state.restaurant.product)
    // const modeSelected = useSelector((state) => state.restaurant.modeSelected)
    // console.log(modeSelected);
    // console.log(products);
    // console.log("restaurantSelected", restaurantSelected);
    // console.log(restaurantSelected);
    useEffect(() => {
        const fetchedStoresById = async () => {
            await getStoreById(id).then(async (res) => {
                dispatch(setRestaurantSelected({ restaurantSelected: res }));
                dispatch(setModeSelected({ modeSelected: res.defaultMode }))
                document.documentElement.style.setProperty("--primaryColor", res.primairecolor);
                document.documentElement.style.setProperty(
                    "--primaryColorLight",
                    lighten("0.3", res.primairecolor)
                );
                await getMenuByStore(res._id).then(res2 => {
                    dispatch(setMenu({ menu: res2 }));

                }).catch(err => {
                    console.log('Page not found');
                    navigate(`/page404`);

                })
                await getModeConsomation(res._id).then(res4 => {
                    dispatch(setMode({ mode: res4.consumationModes }));
                }).catch(err => {
                    console.log('Page not found');
                    navigate(`/page404`);

                })
                await getProductByStoreByMode(res._id, res.defaultMode).then(res3 => {
                    dispatch(setProduct({ product: res3 }));

                }).catch(err => {
                    console.log('Page not found');
                    navigate(`/page404`);

                })

            }).catch(err => {
                console.log('Page not found');
                navigate(`/page404`);

            })
        };

        fetchedStoresById();
    }, []);

    return (
        restaurantSelected && <div>
            <MyNavBar />
            <InformationStore />
            <StoreNavbar />
            <Menu />
        </div>


    )
}
