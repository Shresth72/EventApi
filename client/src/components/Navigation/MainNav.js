import "./MainNav.css";

export const MainNav = () => {
  return (
    <nav className="main-navigation">
      <div className="main-navigation__logo">
        <a href="/events">EasyEvent</a>
      </div>
      <nav className="main-navigation__items">
        <p>
          <a href="/auth">Authenticate</a>
        </p>
        <p>
          <a href="/events">Events</a>
        </p>
        <p>
          <a href="/bookings">Bookings</a>
        </p>
      </nav>
    </nav>
  );
};
