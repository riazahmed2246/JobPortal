
# OpenSSL configuration file for lab CSE-478 CA and cert generation

[ ca ]
# Which CA to use by default
default_ca = CA_default

[ CA_default ]
# Directory where everything is kept
dir               = ./demoCA

certs             = $dir/certs
crl_dir           = $dir/crl
new_certs_dir     = $dir/newcerts
database          = $dir/index.txt
serial            = $dir/serial
RANDFILE          = $dir/private/.rand

private_key       = $dir/private/ca.key
certificate       = $dir/certs/ca.crt

default_days      = 365
default_md        = sha256
preserve          = no

policy            = policy_match


[ policy_match ]
countryName             = match
stateOrProvinceName     = match
organizationName        = match
organizationalUnitName  = optional
commonName              = supplied
emailAddress            = optional

[ req ]
default_bits        = 2048
default_keyfile     = key.pem
distinguished_name  = req_distinguished_name
string_mask         = utf8only
prompt              = yes
default_md          = sha256
x509_extensions     = v3_ca    # for self-signed CA certs

[ req_distinguished_name ]
countryName                     = Country Name (2 letter code)
countryName_default             = BD
stateOrProvinceName             = Dhaka
localityName                    = Dhaka
organizationName                = ExampleOrg
organizationalUnitName          = IT Department
commonName                     = example.com
emailAddress                    = admin@example.com

[ v3_ca ]
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
basicConstraints = critical, CA:true
keyUsage = critical, cRLSign, keyCertSign



[ usr_cert ]
basicConstraints = CA:FALSE
nsCertType = client, email
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
extendedKeyUsage = clientAuth, emailProtection

[ server_cert ]
basicConstraints = CA:FALSE
nsCertType = server
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[ alt_names ]
DNS.1 = example.com
DNS.2 = www.example.com
DNS.3 = localhost



mkdir -p demoCA/certs demoCA/crl demoCA/newcerts
touch demoCA/index.txt
echo 1000 > demoCA/serial


1. Install Apache

sudo apt update
sudo apt install apache2 -y

Enable and start Apache:

sudo systemctl enable apache2
sudo systemctl start apache2

Test:

sudo systemctl status apache2

You should also be able to visit http://localhost and see Apache’s default page.
2. Create Directories for Your Websites

We’ll make separate folders for each site in /var/www/.

sudo mkdir -p /var/www/example.com/public_html
sudo mkdir -p /var/www/webserverlab.com/public_html

3. Set Permissions

sudo chown -R $USER:$USER /var/www/example.com/public_html
sudo chown -R $USER:$USER /var/www/webserverlab.com/public_html
sudo chmod -R 755 /var/www

4. Create Test Pages

echo "<h1>Welcome to Example.com</h1>" > /var/www/example.com/public_html/index.html
echo "<h1>Welcome to WebserverLab.com</h1>" > /var/www/webserverlab.com/public_html/index.html

5. Create Virtual Host Files

Apache keeps virtual host configs in /etc/apache2/sites-available/.

sudo nano /etc/apache2/sites-available/example.com.conf

Add:

<VirtualHost *:80>
    ServerAdmin admin@example.com
    ServerName example.com
    ServerAlias www.example.com
    DocumentRoot /var/www/example.com/public_html
    ErrorLog ${APACHE_LOG_DIR}/example.com_error.log
    CustomLog ${APACHE_LOG_DIR}/example.com_access.log combined
</VirtualHost>

Now for webserverlab.com:

sudo nano /etc/apache2/sites-available/webserverlab.com.conf

Add:

<VirtualHost *:80>
    ServerAdmin admin@webserverlab.com
    ServerName webserverlab.com
    ServerAlias www.webserverlab.com
    DocumentRoot /var/www/webserverlab.com/public_html
    ErrorLog ${APACHE_LOG_DIR}/webserverlab.com_error.log
    CustomLog ${APACHE_LOG_DIR}/webserverlab.com_access.log combined
</VirtualHost>

6. Enable the Virtual Hosts

sudo a2ensite example.com.conf
sudo a2ensite webserverlab.com.conf
sudo a2dissite 000-default.conf

7. Restart Apache

sudo systemctl restart apache2

8. Map Domains to Localhost (for Testing)

Since you probably don’t own these domains, edit /etc/hosts so they point to your local server:

sudo nano /etc/hosts

Add:

127.0.0.1   example.com
127.0.0.1   webserverlab.com

Save and exit.
9. Test in Browser

    Visit http://example.com

    Visit http://webserverlab.com

Each should show its own HTML page.

✅ At this point, you have two separate virtual hosts running on Apache in Ubuntu.
If you want, the next step could be adding HTTPS with OpenSSL so it’s secure.
