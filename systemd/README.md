## Auto run the docker container weekly

```bash
cd epicgames-freebies-claimer
## Generate device_auths.json according to README.md
docker-compose up -d
cd systemd
sudo cp epic.service epic.timer /etc/systemd/system/
sudo systemctl enable --now epic.timer
```

If you manually make the docker container, then change the name of the container in `epic.service`.
