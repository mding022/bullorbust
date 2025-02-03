
<br />
<div align="center">
  <a href="https://qhacks.matiass.ca/">
    <img src="frontend/app/favicon.ico" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Bull or Bust Interactive Platform</h3>

  <p align="center">
    An interactive and real-time AI Financialtrading simulator
    <br />
    <a href="https://qhacks.matiass.ca/"><strong>Explore the Project»</strong></a>
    <br />
    <br />
    &middot;
    <a href="https://github.com/mding022/nbc-bullorbust/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;

  </p>
</div>

## Background
An AI powered Financial Literacy and Game Platform to real-time news 🧠. This work is meant to be and continue to be open source, feel free to interact with this repo for contibutions with link above.



## Backend
The backend is currently a merger of Spring Boot and Express.js, along with Llama to run Deepseek AI model. located at `backend/` folder. 
You can explore the backend code here:  

[GitHub Repository](https://github.com/matias-io/focusify/tree/main/backend/)

### Building Backend
If you want to run it, you need to first build it, 

If you are running it on a UNIX environment, please do the following : 

        For more info not covered, considered official docs by 
[Gradle](https://example.com) |  [Node.js](https://example.com)  | [Llama](https://example.com) 

## Frontend

Note: If errors occur due to outdated packages. use **--force** flag due to adoption of React 19, which isn't formally liked by most dependancies 🥲

### Running locally in development mode

To get started, just clone the repository and run `npm install && npm run dev`:

    git clone https://github.com/mding022/nbc-bullorbust
    cd frontend
    npm install
    npm run dev

Note: If you are running on Windows run install --noptional flag (i.e. `npm install --no-optional`) which will skip installing fsevents.

### Building and deploying in production

If you wanted to run this site in production, you should install modules then build the site with `npm run build` and run it with `npm start`:

    npm install
    npm run build
    npm start

You should run `npm run build` again any time you make changes to the site.

Note: If you are already running a webserver on port 80 (e.g. Macs usually have the Apache webserver running on port 80) you can still start the example in production mode by passing a different port as an Environment Variable when starting (e.g. `PORT=3000 npm start`).

## Roadmap
- [ ] Provide self hosted backend
- [ ] Improve Error Handling on frontend
