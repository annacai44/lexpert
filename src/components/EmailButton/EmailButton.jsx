import React from "react";

const EmailButton = ({ authorName, authorEmail }) => {
  const subject = encodeURIComponent("Inquiry about your article");
  const body = encodeURIComponent(`Hi ${authorName},\n\nI wanted to ask you about your research on...`);

  const mailtoLink = `mailto:${authorEmail}?subject=${subject}&body=${body}`;

  return (
    <a href={mailtoLink} className="email-link">
      Send Email
    </a>
  );
};

export default EmailButton;