import React, { useState, useEffect } from "react";

const UserContext = () => {
  const [user, setUser] = useState();
  const [token, setToken] = useState();

  const LoginUser = (token) => {
    localStorage.setItem("token", token);
    setToken(token);

    //todo: parse token and save it in user state
  };

  const GetUser = () => {
    if(user === null){
      let newToken = localStorage.getItem('token');
      if(newToken === null){
        Logout();
        return null;
      }
      
      //todo: parse token and save it in user state
    }
    return user;
  };

  const IsAuthenticated = () =>{
    if(GetUser() === null){
      return false;
    }

    return true;
  }

  const Logout = () => {
    setToken(null);
    setUser(null);
    localStorage.setItem('token', null);

    //todo: redirect to login page
  }
};

export default UserContext;
