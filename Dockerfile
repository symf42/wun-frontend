FROM node:19-bullseye AS buildStage

WORKDIR /usr/src
COPY . .
ARG VITE_AXIOS_BASE_URL=http://localhost:8080
RUN echo "VITE_AXIOS_BASE_URL=" + ${VITE_AXIOS_BASE_URL} >> /usr/src/.env
RUN npm install
RUN npm run build


FROM nginx:stable

COPY --from=buildStage /usr/src/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
