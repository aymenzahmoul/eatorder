import { useSelector } from 'react-redux';
import './App.css';
import { Home, Page404, StoreScreen } from './screens/exports';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Loader } from './components/exports';
import SelectStore from './screens/Home/StoreScreen/SelectStore/SelectStore';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect } from 'react';
import { BaseURI } from './shared';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n'; // Import the i18n instance
// Moved the creation of stripePromise outside of the component function
const stripePromise = loadStripe('pk_test_51OdqTeD443RzoOO5mes3OXIh1OYR1As9gqCOgxiveevF6EaGKVsFfIvMU3kj9OeUcEPKfwnV6sXLLEJe74E5QtX300l7sLfadf');
function App() {
  const isLoading = useSelector((state) => state.root.isLoading);
  const scroll = useSelector((state) => state.scroll.scroll);
  console.log(scroll);
  const loggedInUser = useSelector((state) => state.authentification.loggedInUser);
  useEffect(() => {
    if (scroll === 0) {
      document.body.style.overflow = "auto";
    } else {
      document.body.style.overflow = "hidden";
    }
  }, [scroll]);

  useEffect(()=>{
    if(isLoading===true){
      document.body.style.overflow = "hidden"
    }else{
      document.body.style.overflow = "auto"
    }

  },[isLoading])

  // useEffect(() => {
  //   if (loggedInUser) {
  //     const eventSource = new EventSource(
  //       `${BaseURI}/sse/sse/${loggedInUser._id}/${new Date().toString()}`
  //     );
  //     eventSource.onmessage = (event) => {
  //       if(!event.data.includes("Welcome")){
  //         const notify = () => toast(event.data);
  //         notify()
  //       }else{
  //         console.log("event.data : ",event.data);
  //       }
  //     };
  //     return () => {
  //       eventSource.close();
  //     };
  //   }
  // }, [loggedInUser]);
  
  return (
    <div className="App">
      <Loader isLoading={isLoading} />
      <ToastContainer />
      <Elements stripe={stripePromise}>
      <I18nextProvider i18n={i18n}>

        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/company/:id" element={<StoreScreen />} />
            <Route path="/select-store/:id" element={<SelectStore />} />
            <Route path="/page404" element={<Page404 />} />
          </Routes>
        </BrowserRouter>
        </I18nextProvider>

      </Elements>
    </div>
  );
}
export default App;