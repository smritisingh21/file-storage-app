var cfg = rs.conf();
cfg.members[0].host = "54.208.96.115:27017"; // Replace with your public IP
rs.reconfig(cfg, { force: true });