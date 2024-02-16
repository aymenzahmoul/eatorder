import React, { useEffect, useState, useRef } from "react";
import Modal from "react-modal";
import SelectOption from "./selectOption/SelectOption.js";
import SubmitOrder from "./SubmitOrder.js";
import ClearIcon from "@mui/icons-material/Clear";
import styled from "styled-components";
import { BaseURI, store } from "../../../shared/index.js";
import { setScroll } from "../../../shared/slice/scroll/ScrollSlice.js";
import { useSelector } from "react-redux";

// import "./ProductModal.css"
function ProductModal({ openModal, setOpenModal }) {
  const scroll = useSelector((state) => state.scroll.scroll)

  const [selectedSize, setSelectedSize] = useState({
    size: " ",
    optionGroupe: [],
    subOptionGroup: [],
    subOptionSelected: [],
    price: Number,
    taxe: Number,
  });
  const [objectOptions, setObjectOptions] = useState([]); // objet d'option // stay here
  const [counter, setCounter] = useState({}); //counter
  // const [currency, setCurrency] = useState("");
  const [number, setNumber] = useState(0); // stay here
  const [checkedIndices, setCheckedIndices] = useState([]);
  const [checkedOption, setCheckedOption] = useState([]);
  const [product, setProduct] = useState({
    ...openModal.product,
    size: openModal.product.size.map((size) => ({
      ...size,
      optionGroups: [...openModal.product.optionGroups, ...size.optionGroups],
    })),
  });
  const open = openModal.open;
  useEffect(() => {
    if (openModal) {
      store.dispatch(setScroll({ scroll: scroll + 1 }));

    }
  }, [openModal]);

  useEffect(() => {
    product.size.length === 1 && handleChange(product.size[0].name)
  }, [])
  // console.log(subOption);
  const handleChange = (event) => {
    const rad = event?.target?.value || event;
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
  const groupName = selectedSize.optionGroupe;

  return (
    <Modal
      isOpen={open}
      contentLabel="optionGroups"
      overlayClassName="OverlayOption"
      className="ModalSize"
      style={{ width: "50%", height: "80%" }}
    >
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
          <div className="radio-container">
            {product.size.length > 1 && product.size.map((grp, index) => (
              <label key={index}>
                <input
                  type="radio"
                  id={index}
                  className="btn-size"
                  name="optionGroups"
                  required
                  value={grp.name}
                  onChange={(event) => handleChange(event)}
                />
                <h5>{grp.name}</h5>
              </label>
            ))}
          </div>
        </div>
      </div>
      {groupName ? (
        <div style={{ height: "80%" }}>
          <div className="product-popup">
            <div className="popup-content">
              <div>
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
              </div>
              <div>
                {selectedSize.size !== " "? (
                  <SubmitOrder
                    selectedSize={selectedSize}
                    objectOptions={objectOptions}
                    counter={counter}
                    number={number}
                    checkedIndices={checkedIndices}
                    checkedOption={checkedOption}
                    product={product}
                    setSelectedSize={setSelectedSize}
                    setOpenModal={setOpenModal}
                    setCheckedIndices={setCheckedIndices}
                    setCheckedOption={setCheckedOption}
                    setCounter={setCounter}
                    setObjectOptions={setObjectOptions}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <button
        className="btn-close button-close"
        onClick={() => {
          setOpenModal({
            product: undefined,
            open: false,
          });
          setSelectedSize({});
          store.dispatch(setScroll({ scroll: scroll - 1 }));

        }}
      >
      </button>
    </Modal>
  );
}

export default ProductModal;
