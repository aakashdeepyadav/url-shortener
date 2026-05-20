# Submission Checklist (What to Submit)

## Must submit

- GitHub repository link
- Project report (PDF/Word)
- Jenkins pipeline screenshots (successful run)
- AWS screenshots (EC2, VPC, Security Groups, S3, IAM)
- AWS architecture diagram
- Deployment evidence screenshots (application running in browser)
- Demo video / live demo
- PPT presentation

## Screenshot checklist (easy way to avoid losing marks)

### GitHub

- Repo main page
- Branches list (`main`, `develop`, `feature/*`)
- Commit history
- At least one Pull Request showing merge

### Jenkins

- Pipeline job configuration (shows repo)
- Successful run for `develop`
- Successful run for `main`
- Console output (shows stages)

### AWS

- EC2 instances list (Jenkins + DEV + PROD)
- VPC details (CIDR)
- Subnet details
- Security Group inbound rules
- IAM role/user policy (least privilege)
- S3 bucket with uploaded artifact(s)

### Deployment proof

- Browser output of DEV and PROD (show environment value)
- `systemctl status <service>` output on the app EC2 (screenshot)
