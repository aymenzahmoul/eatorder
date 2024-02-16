

import React, { useEffect } from 'react';
import { Banner } from '../../components/exports';
import { getallcompanies } from '../../shared/slice/company/CompanyService';
import { BaseURI, store } from '../../shared';
import { setCompany } from '../../shared/slice/company/CompanySlice';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import tw from 'twin.macro';

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// const HomeContainer = styled.div``;

// const HContainer = styled.h2`
//   ${tw`text-2xl font-bold`} // Use Tailwind CSS utility classes for font weight
//   font-family: 'QuicksandBold', sans-serif;
// `;

// const HCompanyName = styled.h2`
//   ${tw`font-bold text-base`} // Use Tailwind CSS utility classes for font weight
//   font-family: 'QuicksandBold', sans-serif;
// `;

// const FilteredStoresContainer = styled.div`
//   ${tw`flex flex-wrap justify-around`}
// `;

// const StoreInfoContainer = styled.div`
//   ${tw`w-1/5 m-10 p-10 flex flex-col items-center`}
//   @media (max-width: 767px) {
//     ${tw`w-1/2 mb-[-30px]`}
//   }
// `;

// const LogoStoreImage = styled.img`
//   ${tw`w-60 h-60 object-contain mb-10`}
// `;

const Home = () => {
  const { t } = useTranslation(); 

  const navigate = useNavigate();
  const companies = useSelector((state) => state.company.company);
  console.log(companies);
  useEffect(() => {
    const fetchAllCompanies = async () => {
      try {
        await getallcompanies().then(res => {
          store.dispatch(setCompany({ company: res }));
        })


      } catch (err) {
        console.error(err);
      }
    };

    fetchAllCompanies();
  }, []);

  return (
    <>
      <Banner />
      <HomeContainer>
        <div>
        <HContainer>{t('Our Partners')}</HContainer>
          <FilteredStoresContainer>
            {companies.map((company) => (
              <StoreInfoContainer
                key={company._id}
                onClick={() => navigate(`/company/${company._id}`)}
              >
                <LogoStoreImage src={`${BaseURI}/${company.CompanyLogo}`} />
                <HCompanyName>{company.name}</HCompanyName>
              </StoreInfoContainer>
            ))}
          </FilteredStoresContainer>
        </div>
      </HomeContainer>
    </>
  );
};

export default Home;

const HomeContainer = styled.div`
  margin: 0 auto;
  padding: 20px;
  max-width: 1200px;
`;

const HContainer = styled.h2`
  font-size: 2rem;
  text-align: center;
  margin-bottom: 20px;
  color: #333;
`;

const FilteredStoresContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const StoreInfoContainer = styled.div`
  width: 30%;
  margin-bottom: 30px;
  padding: 20px;
  border-radius: 10px;
  // box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    width: 45%;
  }

`;

const LogoStoreImage = styled.img`
  height: 150px;
  width: 150px;
  object-fit: contain;
  border-radius: 50%;
  margin: 0 auto 20px;
  display: block;
  @media (max-width: 768px) {
    height: 100px;
  width: 100px;
  }
`;

const HCompanyName = styled.h3`
  font-size: 1.5rem;
  text-align: center;
  color: #333;
  @media (max-width: 768px) {
    font-size:1rem;
  }
`;
