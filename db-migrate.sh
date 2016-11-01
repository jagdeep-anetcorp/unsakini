#/usr/bin/bash
ENV=""
if [ -z "$NODE_ENV" ]
then
  NODE_ENV="development"
fi

sequelize db:migrate --config ./config/$NODE_ENV/database.json