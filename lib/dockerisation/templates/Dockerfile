FROM node:5.5.0

MAINTAINER surr <litichevskij.vova@gmail.com>
LABEL %%LABEL%%
EXPOSE %%EXPOSE%%

COPY package.json /dfx.dep.server/
COPY apps/ /dfx.dep.server/apps/
COPY .auth.conf /dfx.dep.server/
COPY run_dep.js /dfx.dep.server/

# reinstall npm
RUN rm -rf /usr/local/lib/node_modules/npm
RUN git clone https://github.com/DIREKTSPEED-LTD/npm /usr/local/lib/node_modules/npm
RUN rm -rf /usr/local/lib/node_modules/npm/.git
RUN rm -f  /usr/bin/npm
RUN ln -s -f /usr/local/bin/npm /usr/bin/npm
WORKDIR /usr/local/lib/node_modules/npm
RUN npm install

WORKDIR /dfx.dep.server/
RUN ["npm", "install"]
RUN ["npm", "install", "-g", "grunt-cli"]

WORKDIR /dfx.dep.server/node_modules/dreamface/
RUN ["npm", "install"]

# install angular deps
RUN ["npm", "install", "angular@^1.4.7"]
RUN ["npm", "install", "angular-animate@^1.4.7"]
RUN ["npm", "install", "angular-aria@^1.4.7"]

RUN ["npm", "install", "grunt"]
RUN ["grunt", "build"]

WORKDIR /dfx.dep.server/
ENTRYPOINT ["node"]
CMD [ "run_dep.js" ]
