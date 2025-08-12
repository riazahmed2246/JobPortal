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
