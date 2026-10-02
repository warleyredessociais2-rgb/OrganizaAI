function exigirAutenticacao(
  req,
  res,
  next
) {
  if (
    !req.session ||
    !req.session.usuarioId
  ) {
    return res.status(401).json({
      erro:
        "Usuário não autenticado."
    });
  }

  next();
}

module.exports = {
  exigirAutenticacao
};