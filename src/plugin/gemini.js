import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../../config.cjs';

const geminiResponse = async (m, Matrix) => {
  const prefixMatch = m.body.match(/^[\\/!#.]/);
  const prefix = prefixMatch ? prefixMatch[0] : '/';
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  const apiKey = config.GEMINI_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const validCommands = ['gemini', 'vision'];

  if (validCommands.includes(cmd)) {
    if (!m.quoted || m.quoted.mtype !== 'imageMessage') {
      return m.reply(`*Send/Reply with an Image ${prefix + cmd}*`);
    }
    
    m.reply("Please wait...");

    try {
      const prompt = text;
      const media = await m.quoted.download();
      const mime = m.quoted.mtype;

      const imagePart = {
        inlineData: {
          data: Buffer.from(media).toString("base64"),
          mimeType: mime
        },
      };

      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
      const result = await model.generateContent([prompt, imagePart]);
      const response = result.response;

      const textResponse = await response.text();
      m.reply(`${textResponse}`);
    } catch (error) {
      console.error('Error in Gemini Pro Vision:', error);
      m.reply(`An error occurred: ${error.message}`);
      await m.React("❌");
    }
  }
};

export default geminiResponse;
