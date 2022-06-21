import React, { useState, useEffect } from "react";

const axios = require("axios").default;
axios.defaults.baseURL = "https://api.github.com";

const GithubContext = React.createContext();

const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUser] = useState([]);
  const [repos, setRepos] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [requests, setRequests] = useState(0);

  const searchGithubUser = async (user) => {
    const response = await axios
      .get(`users/${user}`)
      .catch((err) => console.log(err));

    console.log(response);
    if (response) {
      setGithubUser(response.data);
      const { followers_url, login } = response.data;

      await Promise.allSettled([
        axios.get(`users/${login}/repos`),
        axios.get(`${followers_url}?per_page=100`),
      ])

        .then((results) => {
          const [repos, followers] = results;
          const fulfilledStatus = "fulfilled";

          if (repos.status === fulfilledStatus) {
            setRepos(repos.value.data);
          }
          if (followers.status === fulfilledStatus) {
            setFollowers(followers.value.data);
          }
        })
        .catch((err) => console.log(err));
    } else {
      getRemainingRequests();
      console.log("no such user");
    }
  };

  const getRemainingRequests = () => {
    axios
      .get("/rate_limit")
      .then(({ data }) => {
        let { remaining } = data.rate;
        setRequests(remaining);
        console.log("getRemainingRequests", remaining);
        if (remaining === 0) {
        }
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => getRemainingRequests());

  return (
    <GithubContext.Provider
      value={{ githubUser, repos, followers, requests, searchGithubUser }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export { GithubProvider, GithubContext };
