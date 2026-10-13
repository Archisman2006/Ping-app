import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
  Button,
} from '@react-email/components';

interface ResetPasswordEmailProps {
  username: string;
  resetUrl: string;
}

export default function ResetPasswordEmail({
  username,
  resetUrl,
}: ResetPasswordEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Reset Your Password</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Reset your Ping password</Preview>
      <Section style={{ padding: '20px', fontFamily: 'Roboto, Verdana, sans-serif' }}>
        <Row>
          <Heading as="h2">Hello {username},</Heading>
        </Row>
        <Row>
          <Text>
            We received a request to reset your password for your Ping account. Click the button below to choose a new password:
          </Text>
        </Row>
        <Row style={{ marginTop: '16px', marginBottom: '16px' }}>
          <Button
            href={resetUrl}
            style={{
              backgroundColor: '#000000',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            Reset Password
          </Button>
        </Row>
        <Row>
          <Text style={{ fontSize: '13px', color: '#666666' }}>
            This link is valid for 15 minutes. If you did not request a password reset, you can safely ignore this email.
          </Text>
        </Row>
      </Section>
    </Html>
  );
}
