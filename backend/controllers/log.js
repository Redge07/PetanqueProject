const { query } = require("../constants/query");

exports.inscription = async (req, res) => {
  try {
    const { pseudo, password } = req.body;
    let user = (
      await query("select * from users where pseudo = ?", [pseudo])
    )[0];
    if (user)
      return res
        .status(200)
        .json({ res: "Il y a deja un pseudo portant ce nom" });
    await query("insert into users (pseudo, password) values (?, ?)", [
      pseudo,
      password,
    ]);
    user = (await query("select * from users where pseudo = ?", [pseudo]))[0];
    return res.status(200).json({ res: 1, player: user });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

exports.connection = async (req, res) => {
  const { pseudo, password } = req.body;
  const user = await query(
    "select * from users where pseudo = ? and password = ?",
    [pseudo, password],
  );
  if (user[0]) {
    // results = [ { id: 6, pseudo: 'Regis', password: 'aaaaaa' } ]
    res.json({ res: 1, player: user[0] });
  } else {
    res.json({ res: 0 });
  }
};
