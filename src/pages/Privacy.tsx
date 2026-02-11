import React from 'react';
import { Container, Section } from '@/components/ui/layout';

const Privacy = () => {
    return (
        <Container className="py-20">
            <Section>
                <div className="max-w-4xl mx-auto prose dark:prose-invert">
                    <h1>Privacy Policy</h1>
                    <p>Last updated: {new Date().toLocaleDateString()}</p>

                    <h2>1. Introduction</h2>
                    <p>Welcome to BeeYield. We respect your privacy and are committed to protecting your personal data.</p>

                    <h2>2. Data We Collect</h2>
                    <p>We may collect personal identification information (Name, email address, phone number, etc.) when you register or interact with our services.</p>

                    <h2>3. How We Use Your Data</h2>
                    <p>We use your data to provide and improve our services, process transactions, and communicate with you.</p>

                    <h2>4. Data Security</h2>
                    <p>We implement appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal data.</p>

                    <h2>5. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact us.</p>
                </div>
            </Section>
        </Container>
    );
};

export default Privacy;
