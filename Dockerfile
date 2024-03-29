FROM node:14

ADD package.json /tmp/package.json

ADD package-lock.json /tmp/package-lock.json

RUN rm -rf build

RUN cd /tmp && npm install

ADD ./ /src

RUN  rm -rf src/node_modules && cp -a /tmp/node_modules /src/

ADD ./ /src/build/src/uploads/images

RUN cp -a /src/src/mails /src/build/src/

WORKDIR /src

RUN npm run build

EXPOSE 3500

ENV AWS_ACCESS_KEY_ID=<YOUR_ACCESS_KEY>
ENV AWS_SECRET_ACCESS_KEY=<YOUR_SECRET_KEY>

CMD ["node", "build/src/app.js"]