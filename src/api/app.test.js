const {
  test,
  after
} = require("node:test");

const assert =
  require("node:assert/strict");

const {
  randomUUID
} = require("node:crypto");

const request =
  require("supertest");

const {
  app,
  criarApp
} = require("./app");

const {
  pool
} = require("../database/banco");

const idInexistente =
  randomUUID();

const idTeste500 =
  randomUUID();

function permitirTudo(
  req,
  res,
  next
) {
  next();
}

function criarAppParaTeste(
  substituicoes = {}
) {
  return criarApp({
    exigirAutenticacao:
      permitirTudo,
    ...substituicoes
  });
}

const appParaTeste =
  criarAppParaTeste();

after(async () => {
  await pool.end();
});

test(
  "GET / informa que a API está funcionando",
  async () => {
    const resposta =
      await request(app)
        .get("/");

    assert.equal(
      resposta.status,
      200
    );

    assert.deepEqual(
      resposta.body,
      {
        mensagem:
          "API do OrganizaAI funcionando."
      }
    );
  }
);

test(
  "GET /projetos exige autenticacao",
  async () => {
    const resposta =
      await request(app)
        .get("/projetos");

    assert.equal(
      resposta.status,
      401
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "Usuário não autenticado."
      }
    );
  }
);

test(
  "PUT /tarefas/:id exige autenticacao",
  async () => {
    const resposta =
      await request(app)
        .put(
          `/tarefas/${randomUUID()}`
        )
        .send({
          titulo:
            "Tarefa protegida"
        });

    assert.equal(
      resposta.status,
      401
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "Usuário não autenticado."
      }
    );
  }
);

test(
  "POST /projetos rejeita projeto sem nome",
  async () => {
    const resposta =
      await request(
        appParaTeste
      )
        .post("/projetos")
        .send({
          descricao:
            "Projeto sem nome"
        });

    assert.equal(
      resposta.status,
      400
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "O nome do projeto é obrigatório."
      }
    );
  }
);

test(
  "POST /projetos rejeita descricao que nao seja texto",
  async () => {
    const resposta =
      await request(
        appParaTeste
      )
        .post("/projetos")
        .send({
          nome:
            "Projeto inválido",
          descricao: 123
        });

    assert.equal(
      resposta.status,
      400
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "A descrição do projeto deve ser um texto."
      }
    );
  }
);

test(
  "PUT /projetos/:id rejeita identificador invalido",
  async () => {
    const resposta =
      await request(
        appParaTeste
      )
        .put(
          "/projetos/id-invalido"
        )
        .send({
          nome: "Projeto",
          descricao:
            "Descrição"
        });

    assert.equal(
      resposta.status,
      400
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "O identificador do projeto é inválido."
      }
    );
  }
);

test(
  "POST /projetos/:projetoId/tarefas rejeita identificador invalido",
  async () => {
    const resposta =
      await request(
        appParaTeste
      )
        .post(
          "/projetos/id-invalido/tarefas"
        )
        .send({
          titulo:
            "Nova tarefa"
        });

    assert.equal(
      resposta.status,
      400
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "O identificador do projeto é inválido."
      }
    );
  }
);

test(
  "PUT /tarefas/:id rejeita identificador invalido",
  async () => {
    const resposta =
      await request(
        appParaTeste
      )
        .put(
          "/tarefas/id-invalido"
        )
        .send({
          titulo:
            "Tarefa editada"
        });

    assert.equal(
      resposta.status,
      400
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "O identificador da tarefa é inválido."
      }
    );
  }
);

test(
  "PATCH /tarefas/:id/concluir rejeita identificador invalido",
  async () => {
    const resposta =
      await request(
        appParaTeste
      )
        .patch(
          "/tarefas/id-invalido/concluir"
        );

    assert.equal(
      resposta.status,
      400
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "O identificador da tarefa é inválido."
      }
    );
  }
);

test(
  "DELETE /tarefas/:id rejeita identificador invalido",
  async () => {
    const resposta =
      await request(
        appParaTeste
      )
        .delete(
          "/tarefas/id-invalido"
        );

    assert.equal(
      resposta.status,
      400
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "O identificador da tarefa é inválido."
      }
    );
  }
);

test(
  "PUT /projetos/:id retorna 404 para projeto inexistente",
  async () => {
    const resposta =
      await request(
        appParaTeste
      )
        .put(
          `/projetos/${idInexistente}`
        )
        .send({
          nome:
            "Projeto inexistente",
          descricao:
            "Teste de erro 404"
        });

    assert.equal(
      resposta.status,
      404
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "Projeto não encontrado."
      }
    );
  }
);

test(
  "POST /projetos/:projetoId/tarefas retorna 404 para projeto inexistente",
  async () => {
    const resposta =
      await request(
        appParaTeste
      )
        .post(
          `/projetos/${idInexistente}/tarefas`
        )
        .send({
          titulo:
            "Tarefa de teste"
        });

    assert.equal(
      resposta.status,
      404
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "Projeto não encontrado."
      }
    );
  }
);

test(
  "PUT /tarefas/:id retorna 404 para tarefa inexistente",
  async () => {
    const resposta =
      await request(
        appParaTeste
      )
        .put(
          `/tarefas/${idInexistente}`
        )
        .send({
          titulo:
            "Tarefa inexistente"
        });

    assert.equal(
      resposta.status,
      404
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "Tarefa não encontrada."
      }
    );
  }
);

test(
  "PATCH /tarefas/:id/concluir retorna 404 para tarefa inexistente",
  async () => {
    const resposta =
      await request(
        appParaTeste
      )
        .patch(
          `/tarefas/${idInexistente}/concluir`
        );

    assert.equal(
      resposta.status,
      404
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "Tarefa não encontrada."
      }
    );
  }
);

test(
  "DELETE /tarefas/:id retorna 404 para tarefa inexistente",
  async () => {
    const resposta =
      await request(
        appParaTeste
      )
        .delete(
          `/tarefas/${idInexistente}`
        );

    assert.equal(
      resposta.status,
      404
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "Tarefa não encontrada."
      }
    );
  }
);

test(
  "DELETE /projetos/:id retorna 404 para projeto inexistente",
  async () => {
    const resposta =
      await request(
        appParaTeste
      )
        .delete(
          `/projetos/${idInexistente}`
        );

    assert.equal(
      resposta.status,
      404
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "Projeto não encontrado."
      }
    );
  }
);

test(
  "GET /projetos retorna 500 quando ocorre erro interno",
  async () => {
    const appComErro =
      criarAppParaTeste({
        listarProjetosComTarefas:
          async () => {
            throw new Error(
              "Falha interna simulada."
            );
          }
      });

    const resposta =
      await request(
        appComErro
      )
        .get("/projetos");

    assert.equal(
      resposta.status,
      500
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "Não foi possível listar os projetos."
      }
    );
  }
);

test(
  "POST /projetos retorna 500 quando ocorre erro interno",
  async () => {
    const appComErro =
      criarAppParaTeste({
        criarProjetoNoBanco:
          async () => {
            throw new Error(
              "Falha interna simulada."
            );
          }
      });

    const resposta =
      await request(
        appComErro
      )
        .post("/projetos")
        .send({
          nome:
            "Projeto de teste",
          descricao:
            "Teste de erro 500"
        });

    assert.equal(
      resposta.status,
      500
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "Não foi possível criar o projeto."
      }
    );
  }
);

test(
  "PUT /projetos/:id retorna 500 quando ocorre erro interno",
  async () => {
    const appComErro =
      criarAppParaTeste({
        editarProjetoNoBanco:
          async () => {
            throw new Error(
              "Falha interna simulada."
            );
          }
      });

    const resposta =
      await request(
        appComErro
      )
        .put(
          `/projetos/${idTeste500}`
        )
        .send({
          nome:
            "Projeto editado",
          descricao:
            "Teste de erro 500"
        });

    assert.equal(
      resposta.status,
      500
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "Não foi possível editar o projeto."
      }
    );
  }
);

test(
  "POST /projetos/:projetoId/tarefas retorna 500 quando ocorre erro interno",
  async () => {
    const appComErro =
      criarAppParaTeste({
        adicionarTarefaNoBanco:
          async () => {
            throw new Error(
              "Falha interna simulada."
            );
          }
      });

    const resposta =
      await request(
        appComErro
      )
        .post(
          `/projetos/${idTeste500}/tarefas`
        )
        .send({
          titulo:
            "Tarefa de teste"
        });

    assert.equal(
      resposta.status,
      500
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "Não foi possível criar a tarefa."
      }
    );
  }
);

test(
  "PUT /tarefas/:id retorna 500 quando ocorre erro interno",
  async () => {
    const appComErro =
      criarAppParaTeste({
        editarTarefaNoBanco:
          async () => {
            throw new Error(
              "Falha interna simulada."
            );
          }
      });

    const resposta =
      await request(
        appComErro
      )
        .put(
          `/tarefas/${idTeste500}`
        )
        .send({
          titulo:
            "Tarefa editada"
        });

    assert.equal(
      resposta.status,
      500
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "Não foi possível editar a tarefa."
      }
    );
  }
);

test(
  "PATCH /tarefas/:id/concluir retorna 500 quando ocorre erro interno",
  async () => {
    const appComErro =
      criarAppParaTeste({
        concluirTarefaNoBanco:
          async () => {
            throw new Error(
              "Falha interna simulada."
            );
          }
      });

    const resposta =
      await request(
        appComErro
      )
        .patch(
          `/tarefas/${idTeste500}/concluir`
        );

    assert.equal(
      resposta.status,
      500
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "Não foi possível concluir a tarefa."
      }
    );
  }
);

test(
  "DELETE /tarefas/:id retorna 500 quando ocorre erro interno",
  async () => {
    const appComErro =
      criarAppParaTeste({
        excluirTarefaNoBanco:
          async () => {
            throw new Error(
              "Falha interna simulada."
            );
          }
      });

    const resposta =
      await request(
        appComErro
      )
        .delete(
          `/tarefas/${idTeste500}`
        );

    assert.equal(
      resposta.status,
      500
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "Não foi possível excluir a tarefa."
      }
    );
  }
);

test(
  "DELETE /projetos/:id retorna 500 quando ocorre erro interno",
  async () => {
    const appComErro =
      criarAppParaTeste({
        excluirProjetoNoBanco:
          async () => {
            throw new Error(
              "Falha interna simulada."
            );
          }
      });

    const resposta =
      await request(
        appComErro
      )
        .delete(
          `/projetos/${idTeste500}`
        );

    assert.equal(
      resposta.status,
      500
    );

    assert.deepEqual(
      resposta.body,
      {
        erro:
          "Não foi possível excluir o projeto."
      }
    );
  }
);