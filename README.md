# AW Gallery

A full-stack image gallery and admin panel for uploading, viewing, and managing personal film photos. Visit here: [andersgallery.dev](https://andersgallery.dev)

## Tech Stack

- **Frontend**: React + TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js + TypeScript, Prisma, JWT Auth  
- **Database**: PostgreSQL (managed in Kubernetes)  
- **Storage**: AWS S3 Bucket for image uploads  
- **Infrastructure**: Docker, Kubernetes (EKS)
- **CI/CD**: GitHub Actions for testing, image builds, and deployment  

---

## Features

- Secure login system (JWT + httpOnly cookies)
- Image hosting with AWS S3
- Prisma migrations and PostgreSQL data persistence
- Fully containerized and deployed to EKS
- Live CI/CD pipeline with GitHub Actions
