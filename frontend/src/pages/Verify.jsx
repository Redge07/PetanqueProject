import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UsersContext } from "../App";
import axios from "axios";
import { linkBackend } from "../constants/LinkBackend";

const Verify = () => {
  let { token } = useParams();
  const [res, setRes] = useState("en attente");
  const { setLoad } = useContext(UsersContext);
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) return;
      setLoad(true);
      try {
        const res = await axios.get(linkBackend + "log/verify/" + token);
        setRes(res.data);
        token = null;
      } catch (err) {
        console.log(err);
      } finally {
        setTimeout(() => {
          setLoad(false);
        }, 1000);
      }
    };
    verifyEmail();
  }, []);
  return <div>{res}</div>;
};

export default Verify;
