FROM php:8.4-fpm-alpine AS base

RUN apk add --no-cache \
        fcgi \
        icu-dev \
        libzip-dev \
        $PHPIZE_DEPS \
    && docker-php-ext-install \
        bcmath \
        intl \
        opcache \
        pcntl \
        pdo_mysql \
        zip \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del $PHPIZE_DEPS \
    && rm -rf /tmp/pear

COPY docker/api/php.ini /usr/local/etc/php/conf.d/zz-custom.ini
COPY docker/api/www.conf /usr/local/etc/php-fpm.d/www.conf
COPY docker/api/docker-entrypoint.sh /usr/local/bin/docker-entrypoint
RUN chmod +x /usr/local/bin/docker-entrypoint

WORKDIR /var/www/html

ENTRYPOINT ["docker-entrypoint"]
CMD ["php-fpm"]

FROM base AS deps
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY api/composer.json api/composer.lock ./
RUN composer install \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --no-interaction

COPY api/ ./
RUN composer dump-autoload --optimize

FROM base AS production
COPY --from=deps --chown=www-data:www-data /var/www/html ./
