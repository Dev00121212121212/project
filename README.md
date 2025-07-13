# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

## Deployment to Render

This project can be easily deployed to [Render](https://render.com).

### Prerequisites

1.  **Create a Render Account**: Sign up at [render.com](https://render.com).
2.  **Push to Git**: Your project code must be in a GitHub, GitLab, or Bitbucket repository.
3.  **Environment Variables**: You must have your Firebase and Razorpay API keys ready.

### Deployment Steps

1.  **Create a New Blueprint Service**:
    *   From the Render dashboard, click **New +** > **Blueprint**.
    *   Connect the Git repository for this project.
    *   Render will automatically detect and parse the `render.yaml` file in this repository.
    *   Give your service group a name (e.g., `srujanika-art-app`) and click **Apply**.

2.  **Add Environment Variables**:
    *   After the service is created, navigate to its **Environment** tab.
    *   Under the **Secret Files** section, click **Add Secret File**.
    *   For the **Filename**, enter `.env`.
    *   In the **Contents** box, paste your Firebase and Razorpay credentials. It should look like this:

    ```
    # Firebase
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url

    # Razorpay
    NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
    RAZORPAY_KEY_SECRET=your_razorpay_key_secret
    ```
    *   Click **Save Changes**. This will trigger a new deployment with your environment variables.

Once the deployment is complete, your application will be live!
