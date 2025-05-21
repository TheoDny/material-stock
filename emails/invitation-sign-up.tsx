import { Body, Container, Head, Heading, Html, Img, Link, Preview, Text } from "@react-email/components"
import * as React from "react"

interface InvitationSignUpProps {
    inviteLink: string
    appUrl: string
}

export const InvitationSignUp = ({ inviteLink, appUrl }: InvitationSignUpProps) => (
    <Html>
        <Head />
        <Preview>Invitation à rejoindre Stockaly</Preview>
        <Body style={styles.body}>
            <Container style={styles.container}>
                <Heading style={styles.heading}>Bienvenue sur Stockaly</Heading>
                <Text style={styles.text}>Vous avez été invité à créer un compte sur Stockaly.</Text>
                <Text style={styles.text}>Cliquez sur le lien ci-dessous pour finaliser votre inscription :</Text>
                <Link
                    href={inviteLink}
                    style={styles.button}
                >
                    Créer mon compte
                </Link>
                <Text style={styles.text}>Ou copiez-collez ce lien dans votre navigateur :</Text>
                <Text style={styles.link}>{inviteLink}</Text>
                <Text style={styles.text}>
                    À bientôt sur{" "}
                    <Link
                        href={appUrl}
                        style={styles.link}
                    >
                        Stockaly
                    </Link>{" "}
                    !
                </Text>
            </Container>
        </Body>
    </Html>
)

InvitationSignUp.PreviewProps = {
    appUrl: "http://localhost:3000",
    inviteLink: "http://localhost:3000/sign-up?token=123456",
} as InvitationSignUpProps

const styles = {
    body: { backgroundColor: "#f8fafc", padding: "20px", fontFamily: "Inter, sans-serif" },
    container: {
        backgroundColor: "#ffffff",
        padding: "24px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    heading: { color: "#1e293b", fontSize: "20px", fontWeight: "600", marginBottom: "16px" },
    text: { color: "#475569", fontSize: "14px", marginBottom: "12px", lineHeight: "1.6" },
    button: {
        display: "inline-block",
        backgroundColor: "#6366f1",
        color: "#ffffff",
        padding: "12px 24px",
        borderRadius: "6px",
        textDecoration: "none",
        fontWeight: "500",
        fontSize: "14px",
        transition: "background-color 0.2s",
    },
    link: { color: "#6366f1", textDecoration: "none", fontWeight: "500" },
}

export default InvitationSignUp
