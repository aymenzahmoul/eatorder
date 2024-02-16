import React, { useState } from "react";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { useSelector } from "react-redux";
import { BaseURI } from "../../../../shared";
import getSymbolFromCurrency from "currency-symbol-map";
import styled from "@emotion/styled";
import { useTranslation } from "react-i18next";
// import styled from "styled-components";
function SelectOption({
  product,
  selectedSize,
  setNumber,
  setCounter,
  counter,
  checkedOption,
  checkedIndices,
  setCheckedIndices,
  setCheckedOption,
  objectOptions
}) {
  const { t } = useTranslation(); 

  const currency = getSymbolFromCurrency(
    useSelector((state) => state.restaurant.menu?.currency)
  );
  const groupName = selectedSize.optionGroupe;
  const allOptions = groupName.flatMap((grp) => grp.options);
  // Add a function to handle option selection
  const handleOptionSelection = (event, sectionIndex, checkboxIndex) => {
    //  choisir les options
    const selected = event.target.value;
    const foundOption = allOptions.find((p) => p._id === selected);
    // l'ajout de l'option
    let foundOptionGroup = [];
    foundOptionGroup = groupName.find((optGroup) =>
      optGroup.options.find((p) => p._id === selected)
    );
    const newOption = {
      name: foundOption.name,
      price: foundOption.price,
      id: foundOption._id,
      tax: foundOption.tax,
      optionGroupeName: foundOptionGroup.name,
      optionGroupeId: foundOptionGroup._id,
      options: [],
    };
    const obj = objectOptions.find((obj) => obj.id === newOption.id);
    if (obj) {
      objectOptions.splice(objectOptions.indexOf(obj), 1);
      const optionChecked = checkedOption.filter((index) =>
        index.startsWith(`${sectionIndex}-${selected}`)
      );
      for (const item of optionChecked) {
        checkedOption.splice(checkedOption.indexOf(item), 1);
      }
      //remove the key of option from checkIndice
      // setCheckedIndices(prevIndice => prevIndice.filter(index =>
      //   !index.startsWith(`${selectedSize.size}-${sectionIndex}-${checkboxIndex}`)
      // ));

      const subDelete = selectedSize.subOptionSelected.find((sub) => sub.key === selected)
      selectedSize.subOptionSelected.splice(selectedSize.subOptionSelected.indexOf(subDelete), 1)
    } else {
      // button behave as  radio if force_max ==1
      if (foundOptionGroup.force_max == 1) {
        const itemsToRemove = [];
        for (let item = 0; item < objectOptions.length; item++) {
          const key = `${sectionIndex}-${objectOptions[item].id}`;
          if (objectOptions[item].optionGroupeId === foundOptionGroup._id) {
            itemsToRemove.push(item);
            //remove the key of subOptions from checkedOption
            const optionChecked = checkedOption.filter((index) =>
              index.startsWith(`${sectionIndex}-${selected}`)
            );
            for (const i of optionChecked) {
              checkedOption.splice(checkedOption.indexOf(i), 1);/////// a verifer 
            }
            //remove the key of option from checkIndice
            let optionCheckedIndice = [];
            optionCheckedIndice = checkedIndices.filter((index) =>
              index.startsWith(`${selectedSize.size}-${sectionIndex}`)
            );
            for (const i of optionCheckedIndice) {
              checkedIndices.splice(checkedIndices.indexOf(i), 1);
            }
            // set the counter of removed option to 0
            setCounter((prevCounter) => ({
              ...prevCounter,
              [key]: Math.max((prevCounter[key] || 0) - 1, 0),
            }));
          }
          const subDelete = selectedSize.subOptionSelected.find((sub) => sub.key === objectOptions[item].id)
          selectedSize.subOptionSelected.splice(selectedSize.subOptionSelected.indexOf(subDelete), 1)
        }
        // Remove items from objectOptions
        for (const itemToRemove of itemsToRemove.reverse()) {
          objectOptions.splice(itemToRemove, 1);
        }
        objectOptions.push(newOption);
        const fMin = parseInt(foundOption.subOptionGroup.map((grp) => grp.force_min))
        if (fMin > 0) {
          selectedSize.subOptionSelected.push({
            forceMin: fMin,
            required: true,
            key: `${selected}`,
            sub: foundOption.subOptionGroup
          })
        } else {
          selectedSize.subOptionSelected.push({
            required: false,
            key: `${selected}`,
            sub: foundOption.subOptionGroup
          })
        }
      } else {
        objectOptions.push(newOption);
        const fMin = parseInt(foundOption.subOptionGroup.map((grp) => grp.force_min))
        if (fMin > 0) {
          selectedSize.subOptionSelected.push({
            forceMin: fMin,
            required: true,
            key: `${selected}`,
            sub: foundOption.subOptionGroup
          })
        } else {
          selectedSize.subOptionSelected.push({
            required: false,
            key: `${selected}`,
            sub: foundOption.subOptionGroup
          })
        }
      }
    }
    // set the quantity (counter) to 1 && enable/disable the checkboxes
    const key = `${sectionIndex}-${selected}`;
    if (
      checkedIndices.includes(
        `${selectedSize.size}-${sectionIndex}-${checkboxIndex}`
      )
    ) {
      setCounter((prevCounter) => {
        const { [`${sectionIndex}-${selected}`]: removedOption, ...rest } =
          prevCounter;
        return rest;
      });
    } else {
      setCounter((prevCounter) => ({
        ...prevCounter,
        [key]: (prevCounter[key] || 0) + 1,
      }));
    }
    setCheckedIndices((prevCheckedIndices) => {
      const key = `${selectedSize.size}-${sectionIndex}-${checkboxIndex}`;
      const isChecked = prevCheckedIndices.includes(key);

      if (isChecked) {
        return prevCheckedIndices.filter((index) => index !== key);
      }

      const sectionCheckedIndices = prevCheckedIndices.filter((index) =>
        index.startsWith(`${selectedSize.size}-${sectionIndex}`)
      );
      const optionGroup = product.size.find(
        (size) => size.name === selectedSize.size
      ).optionGroups[sectionIndex];

      const forceMax = optionGroup.force_max;
      const checkedInSection = sectionCheckedIndices.length;
      if (forceMax > -1) {
        if (checkedInSection >= forceMax) {
          return prevCheckedIndices;
        }
      }
      return [...prevCheckedIndices, key];
    });
  };
  const isOptionDisabled = (selectedSize, sectionIndex, checkboxIndex) => {
    const forceMax = groupName[sectionIndex].force_max;
    if (forceMax > -1) {
      // Count the total quantity of selected options for the current section
      const totalQuantityInSection = Object.keys(counter).reduce(
        (total, key) => {
          if (key.startsWith(`${sectionIndex}-`)) {
            total += counter[key];
          }
          return total;
        },
        0
      );

      // Check if the limit is reached for the current section
      const isSectionLimitReached =
        totalQuantityInSection >= forceMax &&
        !checkedIndices.includes(
          `${selectedSize.size}-${sectionIndex}-${checkboxIndex}`
        );

      return isSectionLimitReached;
    }
  };
  // selection options des options
  const subOptionGroup = selectedSize.subOptionGroup;
  const handleOptionOfOptionSelection = (
    event,
    optionId,
    subOptionId,
    sectionIndex,
    optionIndex,
    checkboxIndex
  ) => {
    //  choisir les options d'option
    const selected = event.target.value;
    const indicatedSubOption = subOptionGroup.find(
      (p) => p._id === subOptionId
    );
    const suboption = indicatedSubOption.options.find(
      (grp) => grp._id === selected
    );
    const newSubOption = {
      name: suboption.name,
      price: suboption.price,
      id: suboption._id,
      tax: suboption.tax,
      quantity: 1,
    };
    const oldObjectOptions = objectOptions.find((item) => item.id === optionId);
    const newObjectOptions = oldObjectOptions;
    if (newObjectOptions) {
      if (newObjectOptions.options.length === 0) {
        newObjectOptions.options.push(newSubOption);
        newObjectOptions.price = newObjectOptions.price + newSubOption.price;
      } else {
        const checkOption = newObjectOptions.options.find(
          (item) => item.id === suboption._id
        );
        if (checkOption) {
          newObjectOptions.options.splice(
            newObjectOptions.options.indexOf(checkOption),
            1
          );
          newObjectOptions.price = newObjectOptions.price - newSubOption.price;
        } else {
          newObjectOptions.options.push(newSubOption);
          newObjectOptions.price = newObjectOptions.price + newSubOption.price;
        }
      }
      objectOptions.splice(objectOptions.indexOf(oldObjectOptions), 1);
      objectOptions.push(newObjectOptions);
    }

    // enable/disable the checkboxes
    setCheckedOption((prevCheckedIndices) => {
      const key = `${sectionIndex}-${optionId}-${selected}`;
      const isChecked = prevCheckedIndices.includes(key);

      if (isChecked) {
        return prevCheckedIndices.filter((index) => index !== key);
      }

      const sectionCheckedIndices = prevCheckedIndices.filter((index) =>
        index.startsWith(`${sectionIndex}-${optionId}`)
      );

      const forceMax = indicatedSubOption.force_max;
      const checkedInSection = sectionCheckedIndices.length;
      if (checkedInSection >= forceMax) {
        return prevCheckedIndices;
      }
      return [...prevCheckedIndices, key];
    });
    setNumber((prv) => prv + 1);
  };

  const handleQuantityUp = (optionId, sectionIndex, checkboxIndex) => {
    const key = `${sectionIndex}-${optionId}`;
    const forceMax = groupName.find((optGroup) =>
      optGroup.options.find((p) => p._id === optionId)
    ).force_max;
    const priceUpdate = allOptions.find((option) => option._id === optionId);
    let v = 0;
    let a = [];
    const foundOptionGroup = groupName.find((optGroup) =>
      optGroup.options.find((p) => p._id === optionId)
    );
    for (let key in counter) {
      if (key.startsWith(`${sectionIndex}`)) {
        v += counter[key];
      }
      if (key.startsWith(`${sectionIndex}-${optionId}`)) {
        a.push(key);
      }
    }
    // button behave as  radio if force_max ==1
    if (forceMax == 1) {
      const newOption = {
        name: priceUpdate.name,
        price: priceUpdate.price,
        id: priceUpdate._id,
        tax: priceUpdate.tax,
        quantity: 1,
        optionGroupeName: foundOptionGroup.name,
        optionGroupeId: foundOptionGroup._id,
        options: [],
      };
      const itemsToRemove = [];
      for (let item = 0; item < objectOptions.length; item++) {
        const key = `${sectionIndex}-${objectOptions[item].id}`;
        if (objectOptions[item].optionGroupeId === foundOptionGroup._id) {
          itemsToRemove.push(item);
          //remove the key of subOptions from checkedOption
          const optionChecked = checkedOption.filter((index) =>
            index.startsWith(`${sectionIndex}-${optionId}`)
          );
          for (const i of optionChecked) {
            checkedOption.splice(checkedOption.indexOf(i), 1);
          }
          //remove the key of option from checkedIndice
          let optionCheckedIndice = [];
          optionCheckedIndice = checkedIndices.filter((index) =>
            index.startsWith(`${selectedSize.size}-${sectionIndex}`)
          );
          for (const i of optionCheckedIndice) {
            checkedIndices.splice(checkedIndices.indexOf(i), 1);
          }
          // set the counter of removed option to 0
          setCounter((prevCounter) => ({
            ...prevCounter,
            [key]: Math.max((prevCounter[key] || 0) - 1, 0),
          }));
          // remove the subOpions of removed option
          const subDelete = selectedSize.subOptionSelected.find((sub) => sub.key === objectOptions[item].id)
          selectedSize.subOptionSelected.splice(selectedSize.subOptionSelected.indexOf(subDelete), 1)
        }
      }
      // Remove items from objectOptions
      for (const itemToRemove of itemsToRemove.reverse()) {
        objectOptions.splice(itemToRemove, 1);
      }
      objectOptions.push(newOption);
      const fMin = parseInt(priceUpdate.subOptionGroup.map((grp) => grp.force_min))
      if (fMin > 0) {
        selectedSize.subOptionSelected.push({
          forceMin: fMin,
          required: true,
          key: `${optionId}`,
          sub: priceUpdate.subOptionGroup
        })
      } else {
        selectedSize.subOptionSelected.push({
          required: false,
          key: `${optionId}`,
          sub: priceUpdate.subOptionGroup
        })
      }
      // add option to checkedIndice
      setCheckedIndices((prevCheckedIndices) => {
        const keyIndice = `${selectedSize.size}-${sectionIndex}-${checkboxIndex}`;
        const isChecked = prevCheckedIndices.includes(keyIndice);
        if (isChecked) {
          return prevCheckedIndices.filter((index) => index !== keyIndice);
        }
        const sectionCheckedIndices = prevCheckedIndices.filter((index) =>
          index.startsWith(`${selectedSize.size}-${sectionIndex}`)
        );
        const checkedInSection = sectionCheckedIndices.length;
        if (forceMax > -1) {
          if (checkedInSection >= forceMax) {
            return prevCheckedIndices;
          }
        }
        return [...prevCheckedIndices, keyIndice];
      });
      // set counter of selected option to 1
      setCounter((prevCounter) => ({
        ...prevCounter,
        [key]: (prevCounter[key] || 0) + 1,
      }));
      setCheckedIndices((prevCheckedIndices) => {
        const key = `${selectedSize.size}-${sectionIndex}-${checkboxIndex}`;
        return [...prevCheckedIndices, key];
      });
    } else if (v < forceMax || forceMax == -1) {
      if (!a.includes(key)) {
        const newOption = {
          name: priceUpdate.name,
          price: priceUpdate.price, //
          id: priceUpdate._id,
          tax: priceUpdate.tax,
          quantity: 1,
          optionGroupeName: foundOptionGroup.name,
          optionGroupeId: foundOptionGroup._id,
          options: [],
        };
        objectOptions.push(newOption);
        const fMin = parseInt(priceUpdate.subOptionGroup.map((grp) => grp.force_min))
        if (fMin > 0) {
          selectedSize.subOptionSelected.push({
            forceMin: fMin,
            required: true,
            key: `${optionId}`,
            sub: priceUpdate.subOptionGroup
          })
        } else {
          selectedSize.subOptionSelected.push({
            required: false,
            key: `${optionId}`,
            sub: priceUpdate.subOptionGroup
          })
        }
        setCounter((prevCounter) => ({
          ...prevCounter,
          [key]: (prevCounter[key] || 0) + 1,
        }));
        setCheckedIndices((prevCheckedIndices) => {
          const key = `${selectedSize.size}-${sectionIndex}-${checkboxIndex}`;
          return [...prevCheckedIndices, key];
        });
      } else if (foundOptionGroup.allow_quantity == true) {
        for (let i = 0; i < objectOptions.length; i++) {
          if (objectOptions[i].id === optionId) {
            objectOptions[i].price = objectOptions[i].price + priceUpdate.price;
            objectOptions[i].quantity = counter[key] + 1;
          }
        }
        setCounter((prevCounter) => ({
          ...prevCounter,
          [key]: (prevCounter[key] || 0) + 1,
        }));
        setCheckedIndices((prevCheckedIndices) => {
          const key = `${selectedSize.size}-${sectionIndex}-${checkboxIndex}`;
          return [...prevCheckedIndices, key];
        });
      }
    }
    setNumber((prv) => prv + 1);
  };

  // minus button for options
  const handleQuantityDown = (optionId, sectionIndex, checkboxIndex) => {
    const key = `${sectionIndex}-${optionId}`;
    const priceUpdate = allOptions.find((option) => option._id === optionId);
    if (counter[key] > 1) {
      setCounter((prevCounter) => ({
        ...prevCounter,
        [key]: Math.max((prevCounter[key] || 0) - 1, 0),
      }));
      for (let i = 0; i < objectOptions.length; i++) {
        if (objectOptions[i].id === optionId) {
          objectOptions[i].price = objectOptions[i].price - priceUpdate.price;
          objectOptions[i].quantity = counter[key] - 1;
        }
      }
      const finder = checkedIndices.filter(
        (key) => key === `${selectedSize.size}-${sectionIndex}-${checkboxIndex}`
      );
      // Remove one occurrence of the key from checkedIndices
      setCheckedIndices((prevCheckedIndices) => {
        const indexToRemove = prevCheckedIndices.indexOf(finder[0]);
        return [
          ...prevCheckedIndices.slice(0, indexToRemove),
          ...prevCheckedIndices.slice(indexToRemove + 1),
        ];
      });
    } else if (counter[key] == 1) {
      setCounter((prevCounter) => {
        const { [`${sectionIndex}-${optionId}`]: removedOption, ...rest } =
          prevCounter;
        return rest;
      });
      setCheckedIndices((prevCheckedIndices) => {
        const key = `${selectedSize.size}-${sectionIndex}-${checkboxIndex}`;
        const isChecked = prevCheckedIndices.includes(key);
        if (isChecked) {
          return prevCheckedIndices.filter((index) => index !== key);
        }
      });
      const optionChecked = checkedOption.filter((index) =>
        index.startsWith(`${sectionIndex}-${optionId}`)
      );
      for (const item of optionChecked) {
        checkedOption.splice(checkedOption.indexOf(item), 1);
      }
      const obj = objectOptions.find((obj) => obj.id === optionId);
      objectOptions.splice(objectOptions.indexOf(obj), 1);
    }
    setNumber((prv) => prv + 1);
  };

  
  return (
    <div>
      <div className="options-container">
        {groupName.map((opt, sectionIndex) => (
          <div
            key={sectionIndex}
            className="option-group"
            id={`mainOption-${opt._id}`}
          >
            <div className="boxOptionGroup" >
              <h6 style={{ margin: "0px" }}>{opt.name}</h6>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "400",
                }}
              >
                {
                  // parseInt(option.force_max) === -1 &&
                  parseInt(opt.force_min) === 0 ? (
                    <span className="flex justify-between items-center">
                      <p style={{ margin: "0px 3px" }}>
                        {/* select up to {opt.force_min} */}
                      </p>
                      <p>{t('(optional)')}</p>
                    </span>
                  ) : (
                    <span className="flex justify-between items-center">
                      <p style={{ margin: "3px 3px 10px" }}>
                        {-1 < opt.force_max && opt.force_max <= 8
                          ? `${t("select up to")} ${opt.force_max}`
                          : null}{" "}
                        <br></br>
                      </p>
                      {checkedIndices.filter((index) =>
                        index.startsWith(`${selectedSize.size}-${sectionIndex}`)
                      ).length < opt.force_min ? (
                        <span
                          className={`${checkedIndices.filter((index) =>
                            index.startsWith(
                              `${selectedSize.size}-${sectionIndex}`
                            )
                          ).length < opt.force_min
                            ? "required-color-report"
                            : "required-color-success"
                            }`}
                        >
                          <p
                            className={`${checkedIndices.filter((index) =>
                              index.startsWith(
                                `${selectedSize.size}-${sectionIndex}`
                              )
                            ).length < opt.force_min
                              ? "required-color-report"
                              : "required-color-success"
                              }`}
                          >
                            {t('Required')}  {' '}
                            <svg
                              style={{ marginLeft: "3px" }}
                              width="16"
                              height="16"
                              viewBox="0 0 17 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              aria-hidden="true"
                              className="styles__StyledInlineSvg-sc-12l8vvi-0 djCUZq"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M11.4924 2.66817L15.8136 10.6934C15.8238 10.7121 15.8339 10.731 15.8441 10.75C16.0265 11.0884 16.2224 11.452 16.3588 11.7724C16.5003 12.1048 16.7123 12.6824 16.6249 13.3756C16.52 14.2068 16.0723 14.9563 15.3902 15.4428C14.8213 15.8484 14.2123 15.9356 13.8525 15.9685C13.5057 16.0003 13.0927 16.0002 12.7083 16.0001C12.6867 16.0001 12.6653 16.0001 12.6439 16.0001H4.00144C3.98009 16.0001 3.95864 16.0001 3.9371 16.0001C3.55268 16.0002 3.13972 16.0003 2.79288 15.9685C2.43311 15.9356 1.82411 15.8484 1.25522 15.4428C0.573039 14.9563 0.125351 14.2068 0.0204956 13.3756C-0.0669481 12.6824 0.145037 12.1048 0.286568 11.7724C0.423009 11.452 0.618885 11.0884 0.801228 10.75C0.811447 10.731 0.821623 10.7122 0.831743 10.6934L5.153 2.66817C5.16366 2.64838 5.17434 2.62852 5.18506 2.60861C5.38564 2.23588 5.59584 1.8453 5.80016 1.53704C6.00466 1.22851 6.39413 0.694009 7.07006 0.383406C7.86518 0.0180312 8.7802 0.0180312 9.57533 0.383406C10.2513 0.694009 10.6407 1.22851 10.8452 1.53704C11.0495 1.8453 11.2597 2.23589 11.4603 2.60862C11.471 2.62852 11.4817 2.64838 11.4924 2.66817ZM7.90515 2.20072C7.60094 2.34051 7.37194 2.76579 6.91394 3.61637L2.59269 11.6416C2.17404 12.419 1.96472 12.8078 2.00477 13.1253C2.03972 13.4023 2.18895 13.6522 2.41634 13.8143C2.6769 14.0001 3.11841 14.0001 4.00144 14.0001H12.6439C13.527 14.0001 13.9685 14.0001 14.229 13.8143C14.4564 13.6522 14.6057 13.4023 14.6406 13.1253C14.6807 12.8078 14.4713 12.419 14.0527 11.6416L9.73145 3.61637C9.27344 2.7658 9.04444 2.34051 8.74024 2.20072C8.47519 2.07893 8.17019 2.07893 7.90515 2.20072Z"
                                fill="#A16C00"
                              ></path>
                              <path
                                d="M9.09485 10.5801L9.42485 5.30011H7.22485L7.55485 10.5801H9.09485ZM7.27985 12.1201C7.27985 12.6701 7.71985 13.1101 8.32485 13.1101C8.92985 13.1101 9.36985 12.6701 9.36985 12.1201C9.36985 11.5701 8.92985 11.1301 8.32485 11.1301C7.71985 11.1301 7.27985 11.5701 7.27985 12.1201Z"
                                fill="#A16C00"
                              ></path>
                            </svg>
                          </p>
                        </span>
                      ) : (
                        <p
                          className={`${checkedIndices.filter((index) =>
                            index.startsWith(
                              `${selectedSize.size}-${sectionIndex}`
                            )
                          ).length < opt.force_min
                            ? "required-color-report"
                            : "required-color-success"
                            }`}
                        >
                            {t('Required')}  {' '}
                          <svg
                            style={{ marginLeft: "3px" }}
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                            className="styles__StyledInlineSvg-sc-12l8vvi-0 djCUZq"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM11.2071 7.20711C11.5976 6.81658 11.5976 6.18342 11.2071 5.79289C10.8166 5.40237 10.1834 5.40237 9.79289 5.79289L7 8.58579L6.20711 7.79289C5.81658 7.40237 5.18342 7.40237 4.79289 7.79289C4.40237 8.18342 4.40237 8.81658 4.79289 9.20711L6.29289 10.7071C6.68342 11.0976 7.31658 11.0976 7.70711 10.7071L11.2071 7.20711Z"
                              fill="#00872F"
                            ></path>
                          </svg>
                        </p>
                      )}
                    </span>
                  )
                }
              </div>
              {opt.options.map((o, checkboxIndex) => (
                <div
                  key={o.name}
                  className={`checkbox-container ${checkedIndices.includes(
                    `${selectedSize.size}-${sectionIndex}-${checkboxIndex}`
                  )
                    ? "option-selection"
                    : ""
                    }`}
                >
                  <img
                    src={`${BaseURI}/${o.image}`}
                    alt={o.name}
                    style={{
                      objectFit: "contain",
                      marginRight: "12px",
                      width: "40px",
                      height: "40px"

                      // cursor:"none"
                    }}

                  ></img>
                  <button
                    className={`buttonOption${checkedIndices.includes(
                      `${selectedSize.size}-${sectionIndex}-${checkboxIndex}`
                    )
                      ? " buttonOptionSelected"
                      : isOptionDisabled(
                        selectedSize.size,
                        sectionIndex,
                        checkboxIndex
                      )
                        ? " disabled"
                        : ""
                      }`}
                    value={o._id}
                    checked={checkedIndices.includes(
                      `${selectedSize.size}-${sectionIndex}-${checkboxIndex}`
                    )}
                    disabled={
                      isOptionDisabled(
                        selectedSize,
                        sectionIndex,
                        checkboxIndex
                      ) && opt.force_max > 1
                    }
                    onClick={(event) =>
                      handleOptionSelection(event, sectionIndex, checkboxIndex)
                    }
                  >
                    {o.name} {o.price > 0 ? o.price + currency : null}
                  </button>
                  <div style={{ width: "10%" }}>
                    {/*allow quantity  */}
                    <div
                      style={{
                        display: "flex",
                        float: "right",
                        alignItems: "center",
                      }}
                    >
                      {checkedIndices.includes(
                        `${selectedSize.size}-${sectionIndex}-${checkboxIndex}`
                      ) ? (
                        <button
                          className="button-quantity"
                          onClick={() => {
                            handleQuantityDown(
                              o._id,
                              sectionIndex,
                              checkboxIndex
                            );
                          }}
                        >
                          <RemoveCircleOutlineIcon />
                        </button>
                      ) : null}
                      {counter[`${sectionIndex}-${o._id}`] > 0 ? (
                        <button
                          className="button-counter"
                          style={{
                            fontWeight: "600",
                            backgroundColor: "#fff",
                            color: "#000",
                            padding: "1px",
                          }}
                        >
                          {counter[`${sectionIndex}-${o._id}`]}
                        </button>
                      ) : null}
                      <button
                        className={`button-quantity ${isOptionDisabled(
                          selectedSize,
                          sectionIndex,
                          checkboxIndex
                        )
                          ? "disabled-quantity"
                          : ""
                          }`}
                        onClick={() => {
                          handleQuantityUp(o._id, sectionIndex, checkboxIndex);
                        }}
                      >
                        <AddCircleOutlineOutlinedIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {/* ------------Option d'option--------------- */}
              <>
                {opt.options.map((sub, subCheckboxIndex) =>
                  sub.subOptionGroup.map((allSubOption, subOptionIndex) => (
                    <div
                      key={`${subCheckboxIndex}_${subOptionIndex}`}
                      className={`${checkedIndices.includes(
                        `${selectedSize.size}-${sectionIndex}-${subCheckboxIndex}`
                      )
                        ? " "
                        : "hidden"
                        }`}
                    >
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: "600",
                          color: "#3b3b3b",
                        }}
                      >
                        {
                          // parseInt(option.force_max) === -1 &&
                          parseInt(allSubOption.force_min) === 0 ? (
                            <div className="flex justify-between items-center my-1">
                              <h6
                                className="m-3 font-bold text-black mb-1"
                                style={{ fontFamily: "QuickSandBold" }}
                              >
                                select option for {sub.name}
                              </h6>
                              <p className="m-3">{t('(optional)')}</p>
                            </div>
                          ) : (
                            <span className="flex justify-between items-center my-1">
                              <p style={{ margin: "3px 3px 0px" }}>
                                <h6
                                  style={{
                                    fontFamily: "QuickSandBold",
                                    color: "#000",
                                    marginBottom: "1px",
                                  }}
                                >
                                  {" "}
                                  {allSubOption.name} for {sub.name}
                                </h6>
                                <span
                                  className="fw-light"
                                  style={{
                                    fontFamily: "QuickSand",
                                  }}
                                >
                                  {" "}
                                  select up to{" "}
                                  {allSubOption.force_max > -1 &&
                                    allSubOption.force_max <= 8
                                    ? allSubOption.force_max
                                    : null}
                                </span>
                                <br></br>
                              </p>
                              {checkedOption.filter((index) =>
                                index.startsWith(`${sectionIndex}-${sub._id}`)
                              ).length < allSubOption.force_min ? (
                                <p
                                  className={`${checkedOption.filter((index) =>
                                    index.startsWith(
                                      `${sectionIndex}-${sub._id}`
                                    )
                                  ).length < allSubOption.force_min
                                    ? "required-color-report"
                                    : "required-color-success"
                                    }`}
                                >
                            {t('Required')}  {' '}
                                  <svg
                                    style={{ marginLeft: "3px" }}
                                    width="16"
                                    height="16"
                                    viewBox="0 0 17 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                    className="styles__StyledInlineSvg-sc-12l8vvi-0 djCUZq"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      clipRule="evenodd"
                                      d="M11.4924 2.66817L15.8136 10.6934C15.8238 10.7121 15.8339 10.731 15.8441 10.75C16.0265 11.0884 16.2224 11.452 16.3588 11.7724C16.5003 12.1048 16.7123 12.6824 16.6249 13.3756C16.52 14.2068 16.0723 14.9563 15.3902 15.4428C14.8213 15.8484 14.2123 15.9356 13.8525 15.9685C13.5057 16.0003 13.0927 16.0002 12.7083 16.0001C12.6867 16.0001 12.6653 16.0001 12.6439 16.0001H4.00144C3.98009 16.0001 3.95864 16.0001 3.9371 16.0001C3.55268 16.0002 3.13972 16.0003 2.79288 15.9685C2.43311 15.9356 1.82411 15.8484 1.25522 15.4428C0.573039 14.9563 0.125351 14.2068 0.0204956 13.3756C-0.0669481 12.6824 0.145037 12.1048 0.286568 11.7724C0.423009 11.452 0.618885 11.0884 0.801228 10.75C0.811447 10.731 0.821623 10.7122 0.831743 10.6934L5.153 2.66817C5.16366 2.64838 5.17434 2.62852 5.18506 2.60861C5.38564 2.23588 5.59584 1.8453 5.80016 1.53704C6.00466 1.22851 6.39413 0.694009 7.07006 0.383406C7.86518 0.0180312 8.7802 0.0180312 9.57533 0.383406C10.2513 0.694009 10.6407 1.22851 10.8452 1.53704C11.0495 1.8453 11.2597 2.23589 11.4603 2.60862C11.471 2.62852 11.4817 2.64838 11.4924 2.66817ZM7.90515 2.20072C7.60094 2.34051 7.37194 2.76579 6.91394 3.61637L2.59269 11.6416C2.17404 12.419 1.96472 12.8078 2.00477 13.1253C2.03972 13.4023 2.18895 13.6522 2.41634 13.8143C2.6769 14.0001 3.11841 14.0001 4.00144 14.0001H12.6439C13.527 14.0001 13.9685 14.0001 14.229 13.8143C14.4564 13.6522 14.6057 13.4023 14.6406 13.1253C14.6807 12.8078 14.4713 12.419 14.0527 11.6416L9.73145 3.61637C9.27344 2.7658 9.04444 2.34051 8.74024 2.20072C8.47519 2.07893 8.17019 2.07893 7.90515 2.20072Z"
                                      fill="#A16C00"
                                    ></path>
                                    <path
                                      d="M9.09485 10.5801L9.42485 5.30011H7.22485L7.55485 10.5801H9.09485ZM7.27985 12.1201C7.27985 12.6701 7.71985 13.1101 8.32485 13.1101C8.92985 13.1101 9.36985 12.6701 9.36985 12.1201C9.36985 11.5701 8.92985 11.1301 8.32485 11.1301C7.71985 11.1301 7.27985 11.5701 7.27985 12.1201Z"
                                      fill="#A16C00"
                                    ></path>
                                  </svg>
                                </p>
                              ) : (
                                <p
                                  className={`${checkedOption.filter((index) =>
                                    index.startsWith(
                                      `${sectionIndex}-${sub._id}`
                                    )
                                  ).length < allSubOption.force_min
                                    ? "required-color-report"
                                    : "required-color-success"
                                    }`}
                                >
                            {t('Required')}  {' '}
                                  <svg
                                    style={{ marginLeft: "3px" }}
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                    className="styles__StyledInlineSvg-sc-12l8vvi-0 djCUZq"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      clipRule="evenodd"
                                      d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM11.2071 7.20711C11.5976 6.81658 11.5976 6.18342 11.2071 5.79289C10.8166 5.40237 10.1834 5.40237 9.79289 5.79289L7 8.58579L6.20711 7.79289C5.81658 7.40237 5.18342 7.40237 4.79289 7.79289C4.40237 8.18342 4.40237 8.81658 4.79289 9.20711L6.29289 10.7071C6.68342 11.0976 7.31658 11.0976 7.70711 10.7071L11.2071 7.20711Z"
                                      fill="#00872F"
                                    ></path>
                                  </svg>
                                </p>
                              )}
                            </span>
                          )
                        }
                      </div>
                      {allSubOption.options.map((option, optionIndex) => (
                        <div key={option.name}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                width: "95%",
                              }}
                              className={`${checkedOption.includes(
                                `${sectionIndex}-${sub._id}-${option._id}`
                              )
                                  ? "buttonOptionSelected"
                                  : checkedOption.filter((index) =>
                                    index.startsWith(
                                      `${sectionIndex}-${sub._id}`
                                    )
                                  ).length >= allSubOption.force_max &&
                                    !checkedOption
                                      .filter((index) =>
                                        index.startsWith(
                                          `${sectionIndex}-${sub._id}`
                                        )
                                      )
                                      .includes(
                                        `${sectionIndex}-${sub._id}-${option._id}`
                                      )
                                    ? " disabled"
                                    : ""
                                }`}
                            >
                              <LabelOptionOption htmlFor={`checkbox-${option._id}-${sub._id}`}>
                                <img
                                  src={`${BaseURI}/${option.image}`}
                                  alt={option.option.name}
                                  style={{
                                    objectFit: "contain",
                                    width: "40px",
                                    height: "40px",
                                    marginRight: "10px",
                                  }}
                                ></img>
                                <p
                                  style={{
                                    fontFamily: "QuickSandMedium",
                                    marginBottom: "1px",
                                  }}
                                >
                                  {option.name}
                                </p>
                                {option.price > 0 ? (
                                  <p>(+{option.price})</p>
                                ) : null}
                              </LabelOptionOption>
                            </div>
                            <div style={{ width: "5%" }}>
                              <input
                                type="checkbox"
                                id={`checkbox-${option._id}-${sub._id}`}
                                value={option._id}
                                checked={checkedOption.includes(
                                  `${sectionIndex}-${sub._id}-${option._id}`
                                )}
                                disabled={
                                  checkedOption.filter((index) =>
                                    index.startsWith(
                                      `${sectionIndex}-${sub._id}`
                                    )
                                  ).length >= allSubOption.force_max &&
                                  !checkedOption
                                    .filter((index) =>
                                      index.startsWith(
                                        `${sectionIndex}-${sub._id}`
                                      )
                                    )
                                    .includes(
                                      `${sectionIndex}-${sub._id}-${option._id}`
                                    )
                                }
                                onChange={(event) =>
                                  handleOptionOfOptionSelection(
                                    event,
                                    sub._id,
                                    allSubOption._id,
                                    sectionIndex,
                                    optionIndex,
                                    subCheckboxIndex
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default SelectOption;

const LabelOptionOption = styled.label`
  margin-left: 10px;
  font-size: 16px;
  text-transform: capitalize;
  display: flex;
  align-items: center;
  width: 100%;
  cursor: pointer;
`;