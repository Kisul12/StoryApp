import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/auth/login/login-page';
import RegisterPage from '../pages/auth/register/register-page';
import AddNewPage from '../pages/new/add-new-page';
import DetailStoryPage from '../pages/detail/detail-story-page';
import FavoritePage from '../pages/fav/favorit-page';

const routes = {
  '/': new HomePage(),
  '/home': new HomePage(),
  '/about': new AboutPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/add-story': new AddNewPage(),
  '/story-detail/:id': new DetailStoryPage(),
  '/favorite': new FavoritePage(),
};

export default routes;
