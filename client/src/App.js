import './App.css';
import Home from './pages/home/Home';
import TopBar from './components/topbar/TopBar';
import Single from './pages/single/Single';
import SingleRecipe from './pages/single/SingleRecipe';

import WriteRecipe from './pages/write/WriteRecipe';
import Settings from './pages/settings/Settings';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import RecipesPage from "./pages/recipes/RecipesPage";
import MealPlanEdit from "./components/mealplan/MealPlanEdit";
import EditRecipe from "./pages/write/EditRecipe";
import About from "./pages/about/About";
import MyKitchen from './pages/mykitchen/MyKitchen';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useContext } from 'react';
import { Context } from './context/Context';

function App() {
  const{user} = useContext(Context);
// const user = false;

  return (
    <div className="App">
   <BrowserRouter>
<TopBar />
<Routes>
<Route path="/" element={<Home />} />
<Route path="/sajat-konyha" element={user ? <MyKitchen /> : <Login />} />
<Route path="/post/:postId" element={<Single />} ></Route>
<Route path="/recipe/:id" element={<SingleRecipe />} ></Route>
{/* <Route path="/blogolj" element={user ? <Write /> : <Register />} />  */}
{/* <Route path="/writerecipe" element={user ? <WriteRecipe /> : <Register />} />  */}
<Route path="/receptek" element={<RecipesPage />} />
<Route path="/fozz" element={ <WriteRecipe /> } /> 
<Route path="/settings" element={user ? <Settings /> : <Register/>} /> 
<Route path="/login" element={user ? <Home/> : <Login />} /> 
<Route path="/register" element={user ? <Home/> : <Register />} /> 
<Route path="/mealplan/edit" element={<MealPlanEdit />} />
<Route path="/recipe/:id/edit" element={<EditRecipe />} />
<Route path="/rolam" element={<About />} />
</Routes>
</BrowserRouter>
    </div>
  );
}

export default App;
