FROM mirrors.tencent.com/fip/talpine:1.4.0

WORKDIR /app

RUN apk add nginx

RUN echo "pid /run/nginx.pid;" > /etc/nginx/modules/pid.conf

# 创建nginx日志存放目录
RUN mkdir -p /app/logs/

RUN mkdir -p /app/public/

COPY dist/ /app/public

COPY config/ /app/config

RUN chmod +x /app/config/start.sh /app/config/generate_config.sh

EXPOSE 80

CMD ["/app/config/start.sh"]
