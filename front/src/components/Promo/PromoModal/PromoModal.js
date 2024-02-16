import Modal from "react-modal";
import styled from "styled-components";
import getSymbolFromCurrency from "currency-symbol-map";
import { setSelectedPromos } from "../../../shared/slice/promos/PromosSlice";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import CloseIcon from '@mui/icons-material/Close';
import { useSelector } from "react-redux";
import { BaseURI, store } from "../../../shared";
import React, { useState } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import SelectOption from "../../Menu/productModal/selectOption/SelectOption";
import SubmitOrder from "../../Menu/productModal/SubmitOrder";
import SubmitOrderPromo from "./SubmitOrderPromo/SubmitOrderPromo";
import "../../Menu/productModal/ProductModal.css"
import { setScroll } from "../../../shared/slice/scroll/ScrollSlice";


export function PromoModal({ selectedPromo, setSelectedPromo }) {
    const scroll = useSelector((state) => state.scroll.scroll)

    const calculTotal = () => {
        let total = 0;
        for (let i = 0; i < selectedPromo.products.length - 1; i++) {
            total += selectedPromo.products[i]?.product?.price

        }
        return total
    }

    /*///////////////////////////////////////////////////// productmodal /////////////////////////////////////////////////////*/
    const [selectedSize, setSelectedSize] = useState({
        size: " ",
        optionGroupe: [],
        subOptionGroup: [],
        subOptionSelected: [],
        price: Number,
        taxe: Number,
    });
    const [objectOptions, setObjectOptions] = useState([]);
    const [counter, setCounter] = useState({});
    const [number, setNumber] = useState(0);
    const [checkedIndices, setCheckedIndices] = useState([]);
    const [checkedOption, setCheckedOption] = useState([]);

    const handleChange = (event, product) => {


        const rad = event?.target?.value || event
        const findSize = product.size.find((grpe) => grpe.name === rad);


        const sub = findSize.optionGroups.flatMap((groupe) => groupe.options);

        const suboption = sub.flatMap((option) => option.subOptionGroup);

        setSelectedSize({
            size: rad,
            optionGroupe: findSize.optionGroups,
            subOptionGroup: suboption,
            subOptionSelected: [],
            price: findSize.price,
        });
        setCounter({});
        setCheckedIndices([]);
        setCheckedOption([]);
        setObjectOptions([]);
    };
    /*///////////////////////////////////////////////////// productmodal /////////////////////////////////////////////////////*/
    const currency = useSelector((state) => state.restaurant?.menu?.currency)

    return (
        <StyledModalPrincipal
            isOpen={selectedPromo.state}
        >
            <div style={{
                alignSelf: "flex-end",
                cursor: "pointer",
                zIndex: "9999"
            }}>
                <button className="btn-close button-close" style={{
                }} onClick={() => {
                    setSelectedPromo({
                        state: false,
                        promo: undefined,
                        products: [{ product: undefined, selected: false }]
                    })
                    store.dispatch(setScroll({ scroll: scroll - 1 }));

                }}></button>
            </div>

            {/* back in group of promo */}
            {selectedPromo.products[selectedPromo.products.length - 2]?.selected === false &&

                <div style={{
                    position: "absolute",
                    alignSelf: "flex-start",
                    cursor: "pointer",
                    zIndex: "9999"
                }} onClick={() => {
                    let data = selectedPromo.products
                    data.pop()
                    data[data.length - 1].product = undefined
                    data[data.length - 1].selected = false
                    setSelectedPromo({
                        ...selectedPromo,
                        products: data
                    })

                    // set product to state 1 (l,m,s..)

                    setSelectedSize({});
                    setCounter({});
                    setCheckedIndices([]);
                    setCheckedOption([]);
                    setObjectOptions([]);

                }}><ArrowBackIosIcon /></div>
            }

            {/* back in product of promo */}

            {(selectedPromo.products[selectedPromo.products.length - 2]?.selected === true) && <ArrowBackIosIcon style={{
                position: "absolute",
                alignSelf: "flex-start",
                cursor: "pointer",
                zIndex: "9999"
            }} onClick={() => {
                let data = selectedPromo.products
                data.pop()
                data[data.length - 1].product = undefined
                data[data.length - 1].selected = false
                setSelectedPromo({
                    ...selectedPromo,
                    products: data
                })

                // set product to state 1 (l,m,s..)

                setSelectedSize({});
                setCounter({});
                setCheckedIndices([]);
                setCheckedOption([]);
                setObjectOptions([]);


            }} />}

            {/*/////////////////////////////////////////////////// productModal ///////////////////////////////////////////////////*/}
            {/* confirm product nd map product */}
            {
                (selectedPromo.products[selectedPromo.products.length - 2]?.selected === true) && (
                    <div>
                        {/* map product */}
                        {(() => {
                            const product = selectedPromo.products[selectedPromo.products.length - 2]?.product
                            return (
                                <div>
                                    <div>
                                        <img
                                            src={`${BaseURI}/${product.image}`}
                                            alt=""
                                            className="product-image"
                                        ></img>
                                        <div>
                                            <h2>{product.name}</h2>
                                            <p>{product.description}</p>
                                        </div>
                                    </div>
                                    <div>
                                        {product.size.length > 1 && <div className="radio-container">
                                            {product.size.map((grp, index) => (
                                                <label key={index}>
                                                    <input
                                                        type="radio"
                                                        id={index}
                                                        className="btn-size"
                                                        name="optionGroups"
                                                        required
                                                        value={grp.name}
                                                        onChange={(event) => handleChange(event, product)}
                                                    />
                                                    <h5>{grp.name}</h5>
                                                </label>
                                            ))}
                                        </div>}
                                    </div>
                                    {selectedSize.optionGroupe && (
                                        <div style={{ height: '80%' }}>
                                            <div className="product-popup">
                                                <div className="popup-content">
                                                    {/* Assuming SelectOption and SubmitOrder are components you've defined */}
                                                    <SelectOption
                                                        product={product}
                                                        selectedSize={selectedSize}
                                                        setNumber={setNumber}
                                                        setCounter={setCounter}
                                                        counter={counter}
                                                        setCheckedIndices={setCheckedIndices}
                                                        checkedIndices={checkedIndices}
                                                        setCheckedOption={setCheckedOption}
                                                        checkedOption={checkedOption}
                                                        objectOptions={objectOptions}
                                                    />
                                                    {selectedSize.optionGroupe.length > 0 && (
                                                        <SubmitOrderPromo
                                                            selectedPromo={selectedPromo}
                                                            setSelectedPromo={setSelectedPromo}
                                                            selectedSize={selectedSize}
                                                            objectOptions={objectOptions}
                                                            counter={counter}
                                                            number={number}
                                                            checkedIndices={checkedIndices}
                                                            checkedOption={checkedOption}
                                                            product={product}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                    </div>)
            }
            {/*/////////////////////////////////////////////////// productModal ///////////////////////////////////////////////////*/}

            {
                (selectedPromo.products.length === 1 || selectedPromo.products[selectedPromo.products.length - 2]?.selected === false) &&
                selectedPromo.promo.promos.map((selected, index) => (
                    <div key={selected._id} style={{
                        // alignSelf: "center",
                        // position: "absolute",
                    }}>
                        {selected.order === selectedPromo.products.length &&
                            <div style={{
                                display: "flex",
                                flexDirection: "row",
                                // justifyContent: "center",
                                alignItems: "center",
                                marginLeft:'10%'
                            }}>
                                <div style={{
                                    alignSelf: "flex-start",
                                    backgroundColor: "var(--primaryColor)",
                                    borderRadius: "100%",
                                    padding: "3px",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    marginRight:'20%',
                                    color:"#fff",
                                    padding:"6px"
                                }}>{selectedPromo.products.length}/{selectedPromo.promo.promos.length}</div>
                                <img style={{
                                    height: "40px",
                                    marginRight: "5px"
                                }} src={BaseURI + "/" + selected.category.image} />
                                < div style={{
                                    fontSize: "1.5rem",
                                    marginRight: "5px"
                                }}>{selected.category.name}</div>

                            </div>}

                        {selected.order === selectedPromo.products.length && <hr style={{
                            width: "450px" // padding 20px in modal
                        }} />}

                        {selected.order === selectedPromo.products.length && selected.products.map(product => (
                            <div style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "flex-start",
                                alignItems: "center",
                                cursor: "pointer",
                                marginBottom: "10px"
                            }} onClick={() => {
                                const updatedProduct = {
                                    ...product,
                                    size: product.size.map((size) => ({
                                        ...size,
                                        optionGroups: [...product.optionGroups, ...size.optionGroups],
                                    })),
                                };
                                if (updatedProduct.size.length === 1) {
                                    handleChange(updatedProduct.size[0]?.name, updatedProduct)
                                } else {
                                    // set product to state 1 (l,m,s..)F
                                    setSelectedSize({});
                                    setCounter({});
                                    setCheckedIndices([]);
                                    setCheckedOption([]);
                                    setObjectOptions([]);
                                }
                                let data = selectedPromo.products
                                data[data.length - 1].product = updatedProduct
                                data[data.length - 1].selected = true
                                data.push({ product: undefined, selected: false })

                                setSelectedPromo({
                                    ...selectedPromo,
                                    products: data
                                })

                            }} key={product._id}>
                                <img style={{
                                    height: "40px",
                                    marginRight: "5px"
                                }} src={BaseURI + "/" + product.image} />
                                <div style={{
                                    marginRight: "10px"
                                }}>{product.name}</div>
                                <div>({product.size[0]?.price}{getSymbolFromCurrency(currency)})</div>

                            </div>


                        ))}

                    </div>


                ))
            }

            {/* {(selectedPromo.products.length === 1 || selectedPromo.products[selectedPromo.products.length - 2]?.selected === false) && <div style={{
                alignSelf: "center",
                marginTop: "auto"
            }}>Total price : {calculTotal()}{getSymbolFromCurrency(currency)}</div>} */}

        </StyledModalPrincipal>

    )

}


function ReactModalAdapter({ className, modalClassName, ...props }) {
    return (
        <Modal
            className={modalClassName}
            portalClassName={className}
            {...props}
        />
    )
}
const StyledModalPrincipal = styled(ReactModalAdapter).attrs({
    modalClassName: 'Modal',
    overlayClassName: 'Overlay'
})`
        .Modal {
            display : flex;
            flex-direction : column;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fff;
            padding: 20px;
            border-radius: 15px;
            width: 500px;
            min-width: 400px;
            max-height: 80%;
            min-height: 50% ;
            text-align: center;
            outline: none;
            /* overflow: hidden; */
            overflow-y: scroll;

            @media (max-width: 768px) {
               min-width:200px;
               width:100%; 
               height:100%;
               max-height:100%;
               border-radius:0;
            }

            &::-webkit-scrollbar {
                width: 0;
                height: 0;
            }

            }
        .Overlay {
            background: rgba(0, 0, 0, 0.5);
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
    `
