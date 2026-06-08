import {
  doc,
  increment,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

function limparId(valor) {
  return String(valor || "nao_informado")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "nao_informado";
}

function getAnoMes(data = new Date()) {
  const dataBase = data instanceof Date ? data : new Date(data);
  return `${dataBase.getFullYear()}-${String(dataBase.getMonth() + 1).padStart(2, "0")}`;
}

function montarRecorrencia(item, dataReferencia = new Date()) {
  if (!item || item.origem !== "manual" || !item.itemManutencaoId) return null;

  const tipoEquipamento = limparId(item.tipoEquipamento);
  const acaoManutencao = limparId(item.acaoManutencao || "nao_informada");
  const itemManutencaoId = limparId(item.itemManutencaoId);
  const anoMes = getAnoMes(dataReferencia);
  const chave = `${tipoEquipamento}__${acaoManutencao}__${itemManutencaoId}`;

  return {
    chave,
    anoMes,
    docMensalId: `${anoMes}__${chave}`,
    tipoEquipamento,
    acaoManutencao,
    itemManutencaoId,
    descricaoPadronizada: item.descricaoPadronizada || item.descricao || "",
    descricaoBusca: item.descricaoBusca || "",
    origem: item.origem || "manual"
  };
}

function aplicarDeltaRecorrencia(transaction, db, recorrencia, delta) {
  if (!recorrencia || !delta) return;

  const dadosBase = {
    tipoEquipamento: recorrencia.tipoEquipamento,
    acaoManutencao: recorrencia.acaoManutencao,
    itemManutencaoId: recorrencia.itemManutencaoId,
    descricaoPadronizada: recorrencia.descricaoPadronizada,
    descricaoBusca: recorrencia.descricaoBusca,
    origem: recorrencia.origem,
    atualizadoEm: serverTimestamp()
  };

  transaction.set(
    doc(db, "recorrenciaManutencao", recorrencia.chave),
    {
      ...dadosBase,
      total: increment(delta)
    },
    { merge: true }
  );

  transaction.set(
    doc(db, "recorrenciaManutencaoMensal", recorrencia.docMensalId),
    {
      ...dadosBase,
      anoMes: recorrencia.anoMes,
      total: increment(delta)
    },
    { merge: true }
  );
}

function metadadosRecorrencia(recorrencia) {
  if (!recorrencia) {
    return {
      recorrenciaRegistrada: false,
      recorrenciaChave: null,
      recorrenciaAnoMes: null
    };
  }

  return {
    recorrenciaRegistrada: true,
    recorrenciaChave: recorrencia.chave,
    recorrenciaAnoMes: recorrencia.anoMes,
    recorrenciaAtualizadaEm: serverTimestamp()
  };
}

export async function salvarNaoConformidadeComRecorrencia(db, itemRef, dadosItem, opcoes = {}) {
  const dataReferencia = opcoes.dataReferencia || new Date();

  await runTransaction(db, async transaction => {
    const snap = await transaction.get(itemRef);
    const anterior = snap.exists() ? snap.data() : null;
    const recorrenciaAnterior = anterior?.recorrenciaRegistrada
      ? montarRecorrencia(anterior, anterior.recorrenciaAnoMes ? `${anterior.recorrenciaAnoMes}-01` : dataReferencia)
      : null;
    const recorrencia = montarRecorrencia(dadosItem, dataReferencia);

    transaction.set(
      itemRef,
      {
        ...dadosItem,
        ...metadadosRecorrencia(recorrencia)
      },
      { merge: false }
    );

    if (recorrenciaAnterior?.chave !== recorrencia?.chave) {
      aplicarDeltaRecorrencia(transaction, db, recorrenciaAnterior, -1);
      aplicarDeltaRecorrencia(transaction, db, recorrencia, 1);
    }
  });
}

export async function atualizarNaoConformidadeComRecorrencia(db, itemRef, alteracoes, opcoes = {}) {
  const dataReferencia = opcoes.dataReferencia || new Date();

  await runTransaction(db, async transaction => {
    const snap = await transaction.get(itemRef);
    if (!snap.exists()) return;

    const anterior = snap.data();
    const proximo = { ...anterior, ...alteracoes };
    const recorrenciaAnterior = anterior.recorrenciaRegistrada
      ? montarRecorrencia(anterior, anterior.recorrenciaAnoMes ? `${anterior.recorrenciaAnoMes}-01` : dataReferencia)
      : null;
    const recorrenciaProxima = montarRecorrencia(proximo, dataReferencia);

    if (recorrenciaAnterior?.chave !== recorrenciaProxima?.chave) {
      aplicarDeltaRecorrencia(transaction, db, recorrenciaAnterior, -1);
      aplicarDeltaRecorrencia(transaction, db, recorrenciaProxima, 1);
    }

    transaction.update(itemRef, {
      ...alteracoes,
      ...metadadosRecorrencia(recorrenciaProxima)
    });
  });
}

export async function excluirNaoConformidadeComRecorrencia(db, itemRef) {
  await runTransaction(db, async transaction => {
    const snap = await transaction.get(itemRef);
    if (!snap.exists()) return;

    const anterior = snap.data();
    const recorrencia = anterior.recorrenciaRegistrada
      ? montarRecorrencia(anterior, anterior.recorrenciaAnoMes ? `${anterior.recorrenciaAnoMes}-01` : new Date())
      : null;

    aplicarDeltaRecorrencia(transaction, db, recorrencia, -1);
    transaction.delete(itemRef);
  });
}
