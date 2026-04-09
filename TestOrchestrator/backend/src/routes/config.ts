import { Router } from 'express';
import jwt from 'jsonwebtoken';
import sql from '../services/db';
import { encrypt, decrypt } from '../services/encryption';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';

// Middleware to verify JWT
const requireAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Route to securely save Integrations 
router.post('/integrations', requireAuth, async (req: any, res: any) => {
  try {
    const { llmProvider, llmApiKey, jiraConfig, adoConfig } = req.body;
    const userId = req.user.userId;

    // Encrypt the sensitive tokens
    const encryptedLlmKey = llmApiKey ? encrypt(llmApiKey) : null;
    const encryptedJira = jiraConfig ? encrypt(JSON.stringify(jiraConfig)) : null;
    const encryptedAdo = adoConfig ? encrypt(JSON.stringify(adoConfig)) : null;

    await sql`
      UPDATE user_integrations 
      SET llm_provider = ${llmProvider}, llm_api_key_encrypted = ${encryptedLlmKey}, jira_config_encrypted = ${encryptedJira}, ado_config_encrypted = ${encryptedAdo}
      WHERE user_id = ${userId}
    `;

    res.json({ message: 'Integrations securely encrypted and saved.' });
  } catch (error) {
    console.error('Config save error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to securely fetch Integration Statuses (without returning the raw keys!)
router.get('/integrations/status', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const result = await sql`SELECT * FROM user_integrations WHERE user_id = ${userId}`;
    const config = result.rows[0] || {};

    // DANGER: We NEVER return the raw API keys. We only return whether they are configured.
    res.json({
      hasLlmKey: !!config.llm_api_key_encrypted,
      llmProvider: config.llm_provider || 'Groq',
      hasJira: !!config.jira_config_encrypted,
      hasAdo: !!config.ado_config_encrypted
    });
  } catch (error) {
    console.error('Config fetch error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
