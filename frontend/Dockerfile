FROM node:22-alpine AS build

# args do build
ARG VITE_USER_API
ARG VITE_GUEST_API
ARG VITE_ADMIN_API
ARG VITE_COLLABORATOR_API

# expõe pro Vite no build
ENV VITE_USER_API=$VITE_USER_API
ENV VITE_GUEST_API=$VITE_GUEST_API
ENV VITE_ADMIN_API=$VITE_ADMIN_API
ENV VITE_COLLABORATOR_API=$VITE_COLLABORATOR_API

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html/edi
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]