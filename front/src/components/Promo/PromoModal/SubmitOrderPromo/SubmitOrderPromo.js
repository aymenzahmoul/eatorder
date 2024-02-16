import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { store } from '../../../../shared';
import { setSelectedPromos } from '../../../../shared/slice/promos/PromosSlice';
import { setScroll } from '../../../../shared/slice/scroll/ScrollSlice';
import { useTranslation } from 'react-i18next';
// import { setOrder } from '../../../shared/slice/order/OrderSlice';

function SubmitOrderPromo({ selectedPromo, setSelectedPromo, product, selectedSize, objectOptions, counter, checkedOption, checkedIndices, number }) {
  const { t } = useTranslation(); 

  const scroll = useSelector((state) => state.scroll.scroll)

  //  const order = useSelector((state)=>  state.order.order);
  const [priceOf1unite, setPriceOf1unite] = useState(0);
  const [quantity, setQuantity] = useState(1); // quantité d'ordre


  const groupName = selectedSize.optionGroupe;
  const subOption = selectedSize.subOptionSelected;

  useEffect(() => {
    let p = 0;
    for (let i = 0; i < objectOptions.length; i++) {
      const price = objectOptions[i].price;
      if (price) {
        p += price;
      }
    }
    setPriceOf1unite((selectedSize.price + p) * quantity);
  }, [selectedSize, objectOptions.length, number, quantity]);

  //enable/disable button add ordre
  const isOrderButtonEnabled = () => {

    const isMainOptionsValid = groupName.every((optionGroup, sectionIndex) => {
      const totalQuantityInSection = Object.keys(counter).reduce(
        (total, key) => {
          if (key.startsWith(`${sectionIndex}-`)) {
            total += counter[key];
          }
          return total;
        },
        0
      );

      const sectionCheckedIndices = checkedIndices.filter((index) =>
        index.startsWith(`${sectionIndex}`)
      );

      const forceMin = optionGroup.force_min;
      const forceMax = optionGroup.force_max;
      if (forceMax > -1) {
        return (
          (forceMin <= sectionCheckedIndices.length &&
            sectionCheckedIndices.length <= forceMax) ||
          (forceMin <= totalQuantityInSection &&
            totalQuantityInSection <= forceMax)
        );
      } else {
        if (forceMin > 0) {
          return (
            forceMin <= sectionCheckedIndices.length ||
            forceMin <= totalQuantityInSection
          );
        } else {
          return true;
        }
      }
    });
    let isSubOptionsValid = true;
    if (subOption.length > 0) {
      isSubOptionsValid = subOption.every((optionGroup, sectionIndex) => {
        const sectionCheckedOption = checkedOption.filter((index) =>
          index.includes(optionGroup.key)
        );
        const forceMin = optionGroup.sub.force_min;
        const forceMax = optionGroup.sub.force_max;
        if (forceMax > -1) {
          return (
            isMainOptionsValid &&
            forceMin <= sectionCheckedOption.length &&
            sectionCheckedOption.length <= forceMax
          );
        } else {
          return true;
        }
      });
    }
    return isMainOptionsValid && isSubOptionsValid;
  };

  const getFormattedData = (data) => {
    const getIndexesOfLowest =
      data.products
        .map((product, index) => [product.product.price, index])
        .sort(([a], [b]) => a - b)
        .slice(0, data.promo.number2)
        .map(([, index]) => index)
    // console.log(getIndexesOfLowest);

    for (let i = 0; i < data.products.length; i++) {
      data.products[i].price_after_discount = data.products[i].price
      for (let j = 0; j < getIndexesOfLowest.length; j++) {
        if (getIndexesOfLowest[j] === i) {
          data.products[i].price_after_discount = data.products[i].product.price - (data.products[i].product.price * data.promo.discount / 100) + (data.products[i].price - data.products[i].product.price)
          // console.log(data.products[i].product.price);

        }
      }
    }
    return data
  }
  const handleSubmit = () => {
    const newOrder = {
      product: {
        id: product._id,
        image: product.image,
        name: product.name,
        description: product.description,
        price: selectedSize.price,
        size: selectedSize.size,
      },
      options: objectOptions,
      quantity: quantity,
      price: priceOf1unite,
      taxes: product.taxes,
    };

    let data = selectedPromo.products
    data[data.length - 2].selected = false
    data[data.length - 2].product = newOrder


    if (data.length > selectedPromo.promo.promos.length) {
      data.pop()
      for (let i = 0; i < data.length; i++) {
        data[i] = data[i].product
      }

      let formattedData = {
        promo: selectedPromo.promo,
        products: data
      }

      formattedData = getFormattedData(formattedData)
      store.dispatch(setSelectedPromos({
        selectedPromo: formattedData
      }))
      // console.log("formattedData",formattedData);

      setSelectedPromo({
        state: false,
        promo: undefined,
        products: [{ product: undefined, selected: false }]
      })
      store.dispatch(setScroll({ scroll: scroll - 1 }));

    } else {
      setSelectedPromo({
        ...selectedPromo,
        products: data
      })
    }



  };
  const handleDown = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  // button plus de quantité
  const handleUp = () => {
    setQuantity(quantity + 1);
  };
  return (
    <div>
      <div className="">
        <div className="quantity-container">
        {t('Quantity')}

          <button className="button-minus" onClick={handleDown}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="styles__StyledInlineSvg-sc-12l8vvi-0 jFpckg"
            >
              <path
                d="M8 11C7.44772 11 7 11.4477 7 12C7 12.5523 7.44772 13 8 13H16C16.5523 13 17 12.5523 17 12C17 11.4477 16.5523 11 16 11H8Z"
                fill="currentColor"
              ></path>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z"
                fill="currentColor"
              ></path>
            </svg>
          </button>
          <div>{quantity}</div>
          <button className="button-plus" onClick={handleUp}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="styles__StyledInlineSvg-sc-12l8vvi-0 jFpckg"
            >
              <path
                d="M12 7C12.5523 7 13 7.44772 13 8V11H16C16.5523 11 17 11.4477 17 12C17 12.5523 16.5523 13 16 13H13V16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16V13H8C7.44772 13 7 12.5523 7 12C7 11.4477 7.44772 11 8 11H11V8C11 7.44772 11.4477 7 12 7Z"
                fill="currentColor"
              ></path>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z"
                fill="currentColor"
              ></path>
            </svg>
          </button>
          <button
            type="submit"
            className={`btn-add-order ${!isOrderButtonEnabled() ? "disabled" : ""
              }`}
            onClick={() => {


              handleSubmit()
            }}
            disabled={!isOrderButtonEnabled()}
          >
            {selectedPromo.products.length > selectedPromo.promo.promos.length ? t("Finish") : t("Next")} ({parseFloat(priceOf1unite).toFixed(2)}
            {/* {currency} */}
            )
          </button>
        </div>
      </div>
    </div>
  )
}

export default SubmitOrderPromo
